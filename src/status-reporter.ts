/** Passive lifecycle bridge. Never reads transcripts or changes agent decisions. */
import * as cp from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { randomUUID } from 'crypto';
const processStartedAt = Date.now();
import { AgentState } from './agent-status';
import { PaneProcess, parseProcessSnapshot } from './working-status';
import { readStatusRecord, statusDirectory, writeStatusRecord } from './status-record';
function tmuxPath(): string | undefined {
  return ['/opt/homebrew/bin/tmux', '/usr/local/bin/tmux', '/usr/bin/tmux'].find(p => fs.existsSync(p));
}
function socketArgs(): string[] {
  for (const directory of [process.env.TMUX_TMPDIR, '/tmp', '/private/tmp', process.env.TMPDIR]) {
    if (!directory) continue;
    const socket = path.join(directory, `tmux-${process.getuid?.() ?? ''}`, 'terminal-tabs');
    if (fs.existsSync(socket)) return ['-S', socket];
  }
  return ['-L', 'terminal-tabs'];
}

export function hookState(application: string, input: Record<string, unknown>): AgentState | undefined {
  const event = String(input.hook_event_name ?? input.hookEventName ?? '').replace(/_/g, '').toLowerCase();
  if (input.subagentType || input.agent_type) return undefined;
  if (application === 'gemini') return event === 'sessionstart' ? 'unknown' : undefined;
  if (application !== 'grok') return undefined;
  if (event === 'userpromptsubmit') return 'unknown'; // a prompt can be cancelled before a turn starts
  if (['pretooluse', 'posttooluse', 'posttoolusefailure', 'precompact', 'postcompact'].includes(event)) return 'working';
  if (['sessionstart', 'stop', 'stopfailure', 'stopcancelled', 'sessionend'].includes(event)) return 'idle';
  if (event === 'notification') {
    const type = input.notificationType ?? input.notification_type;
    if (type === 'permission_prompt') return 'waiting';
    if (type === 'idle_prompt') return 'idle';
  }
  return undefined;
}

export function grokBirthMatches(stamp: unknown, owner: PaneProcess): boolean {
  // Grok's macOS registry uses epoch microseconds; ps lstart has second precision.
  const start = owner.startTime && Date.parse(`${owner.startTime} UTC`);
  return typeof stamp === 'number' && Number.isSafeInteger(stamp) && typeof start === 'number' &&
    Number.isFinite(start) && stamp >= start * 1000 && stamp < (start + 1000) * 1000;
}

function ancestors(pid: string, processes: Map<string, PaneProcess>): PaneProcess[] {
  const result: PaneProcess[] = [], seen = new Set<string>();
  for (let p = processes.get(pid); p && !seen.has(p.pid); p = processes.get(p.ppid)) {
    seen.add(p.pid); result.push(p);
  }
  return result;
}

export async function report(application: string, state: AgentState, session: string, explicitPid?: string, updated = Date.now(), preserveWait = false): Promise<boolean> {
  if (!/^[a-z][a-z0-9-]{0,63}$/.test(application) || !['working','waiting','idle','unknown'].includes(state) || !session || session.length > 255) return false;
  const snapshot = parseProcessSnapshot(cp.execFileSync('ps', ['-axo', 'pid=,ppid=,pgid=,tpgid=,tty=,stat=,rss=,lstart=,comm='],
    { encoding: 'utf8', env: { ...process.env, LC_ALL: 'C', TZ: 'UTC' }, timeout: 1500, maxBuffer: 8 * 1024 * 1024 }));
  const parents = ancestors(String(process.ppid), snapshot);
  let owner: PaneProcess | undefined;
  if (explicitPid) owner = parents.find(p => p.pid === explicitPid);
  else if (application === 'gemini') owner = parents.find(p => /^(node|gemini)$/.test(path.basename(p.command)));
  else if (application === 'grok') {
    // Grok's hooks can execute in its leader, outside the interactive TTY tree.
    const root = process.env.GROK_HOME || path.join(os.homedir(), '.grok');
    const registryFile = path.join(root, 'active_sessions.json');
    if (fs.statSync(registryFile).size > 1024 * 1024) return false;
    const registry = JSON.parse(fs.readFileSync(registryFile, 'utf8'));
    if (!Array.isArray(registry)) return false;
    const matches = registry.filter(r => r?.session_id === session && typeof r.pid === 'number');
    if (matches.length !== 1) return false;
    owner = snapshot.get(String(matches[0].pid));
    if (owner && (path.basename(owner.command) !== 'grok' || !grokBirthMatches(matches[0].pid_start, owner))) return false;
  }
  if (!owner?.startTime || owner.pgid !== owner.tpgid || /[TZtX]/.test(owner.state) || ['?', '??'].includes(owner.tty) ||
      /^(?:ba|z|fi)?sh$/.test(path.basename(owner.command))) return false;
  const tmux = tmuxPath(); if (!tmux) return false;
  const panes = cp.execFileSync(tmux, [...socketArgs(), 'list-panes', '-a', '-F', '#{session_name}|#{pane_pid}|#{pane_tty}'],
    { encoding: 'utf8', timeout: 1500, stdio: ['ignore','pipe','ignore'] }).trim().split('\n');
  const ancestry = ancestors(owner.pid, snapshot);
  const matching = panes.filter(line => {
    const [name, pid, tty] = line.split('|');
    return /^tt-[a-zA-Z0-9-]+$/.test(name) && tty?.replace(/^\/dev\//, '') === owner!.tty && ancestry.some(p => p.pid === pid);
  });
  if (matching.length !== 1) return false;
  const tmuxName = matching[0].split('|')[0];
  const directory = statusDirectory(); fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const lock = path.join(directory, `${owner.pid}.lock`);
  const nonce = randomUUID();
  for (let attempt = 0; attempt < 20; attempt++) {
    let fd: number;
    try { fd = fs.openSync(lock, 'wx', 0o600); fs.writeSync(fd, nonce); }
    catch {
      try { if (Date.now() - fs.statSync(lock).mtimeMs > 5000) fs.unlinkSync(lock); } catch { /* another writer finished */ }
      await new Promise(resolve => setTimeout(resolve, 10)); continue;
    }
    try {
      const old = readStatusRecord(owner, tmuxName, directory);
      if (old && (old.updated > updated || (old.updated === updated && old.state === 'idle' && state === 'working'))) return false;
      if (preserveWait && state === 'working' && old?.state === 'waiting') state = 'waiting';
      writeStatusRecord({ schema: 1, pid: owner.pid, startTime: owner.startTime, tmux: tmuxName, application, session, state, updated }, directory);
      return true;
    } finally {
      fs.closeSync(fd);
      try { if (fs.readFileSync(lock, 'utf8') === nonce) fs.unlinkSync(lock); } catch { /* no longer our lock */ }
    }
  }
  return false;
}

async function main(): Promise<void> {
  const [mode, application, stateArg, ...args] = process.argv.slice(2);
  if (mode === 'hook' || mode === 'status') {
    let input = '';
    for await (const chunk of process.stdin) {
      input += chunk; if (input.length > 1024 * 1024) return;
    }
    const data = JSON.parse(input);
    const state = mode === 'status' && application === 'grok'
      ? (typeof data.turn?.started_at_ms === 'number' ? 'working' : 'idle') : hookState(application, data);
    if (state) {
      const time = Date.parse(String(data.timestamp));
      await report(application, state, String(data.sessionId ?? data.session_id ?? ''), undefined,
        Number.isFinite(time) && time <= Date.now() ? time : processStartedAt, mode === 'status');
    }
  } else if (mode === 'report') {
    const pidIndex = args.indexOf('--pid'), sessionIndex = args.indexOf('--session');
    if (pidIndex < 0 || sessionIndex < 0) throw Error('report requires --pid and --session');
    if (!await report(application, stateArg as AgentState, args[sessionIndex + 1], args[pidIndex + 1])) throw Error('No verified foreground owner');
  } else throw Error('Use hook <grok|gemini> or report <application> <state> --pid PID --session ID');
}
if (require.main === module) {
  main().then(() => { if (process.argv[2] === 'hook') process.stdout.write('{}\n'); }).catch(() => {
    if (process.argv[2] === 'hook') process.stdout.write('{}\n'); // observability never blocks user work
    else if (process.argv[2] === 'status') { /* native status-line observer stays silent */ }
    else { process.stderr.write('PTT status: could not verify the foreground process.\n'); process.exitCode = 1; }
  });
}
