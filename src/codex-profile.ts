import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as cp from 'child_process';

export interface CodexBinding { id: string; home: string }
export interface CodexObservation { id?: string; home: string }
const observedHomes = new Set<string>();
export function registerCodexHome(home: string): void { if (path.isAbsolute(home)) observedHomes.add(home); }
export interface CodexRollout extends CodexBinding { file: string }
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const bindingsFile = () => path.join(os.homedir(), '.terminal-tabs', 'codex-bindings.json');
export function validBinding(value: unknown): value is CodexBinding {
  const b = value as CodexBinding | undefined;
  return !!b && typeof b.id === 'string' && new RegExp(`^${UUID}$`, 'i').test(b.id)
    && typeof b.home === 'string' && path.isAbsolute(b.home) && !/[\r\n\0]/.test(b.home);
}
export function savedCodexBindings(): Record<string, CodexBinding> {
  let bindings: Record<string, CodexBinding> = {};
  try {
    const data = JSON.parse(fs.readFileSync(bindingsFile(), 'utf8'));
    bindings = Object.fromEntries(Object.entries(data).filter(([, b]) => validBinding(b))) as Record<string, CodexBinding>;
  } catch { /* Legacy aggregate is optional. */ }
  const dir = path.join(os.homedir(), '.terminal-tabs', 'codex-bindings');
  try {
    for (const file of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
      try {
        const value = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
        if (validBinding(value)) bindings[decodeURIComponent(file.slice(0, -5))] = value;
      } catch { /* An incomplete/corrupt record cannot erase other tabs. */ }
    }
  } catch { /* No profile bindings yet. */ }
  return bindings;
}
/** One atomic record per tab: parallel VS Code windows cannot erase each other's identities. */
export function saveCodexBinding(tab: string, binding: CodexBinding): void {
  if (!tab || !validBinding(binding)) throw new Error('Invalid Codex binding');
  const dir = path.join(os.homedir(), '.terminal-tabs', 'codex-bindings');
  const file = path.join(dir, encodeURIComponent(tab) + '.json');
  try {
    const old = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (old.id === binding.id && old.home === binding.home) return;
  } catch { /* First observation or repair of this exact tab. */ }
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const tmp = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, JSON.stringify(binding, null, 2) + '\n', { mode: 0o600 });
  fs.renameSync(tmp, file);
}
export function codexHomes(): string[] {
  return [...new Set([process.env.CODEX_HOME, path.join(os.homedir(), '.codex'),
    path.join(os.homedir(), '.codex-cli'), ...observedHomes, ...Object.values(savedCodexBindings()).map(b => b.home)]
    .filter((p): p is string => !!p && path.isAbsolute(p)))];
}
/** Only rollout paths with matching native metadata qualify; never inspect credentials. */
export function codexRollout(file: string): CodexRollout | undefined {
  const normalized = path.resolve(file);
  const match = normalized.match(new RegExp(`^(.*)[/\\\\]sessions[/\\\\].*[/\\\\]rollout-[^/\\\\]+-(${UUID})\\.jsonl$`, 'i'));
  if (!match) return undefined;
  let fd: number | undefined;
  try {
    fd = fs.openSync(file, 'r');
    const buffer = Buffer.alloc(256 * 1024);
    const length = fs.readSync(fd, buffer, 0, buffer.length, 0);
    const first = buffer.subarray(0, length).toString('utf8').split('\n')[0];
    const row = JSON.parse(first);
    if (row.type !== 'session_meta' || (row.payload?.id ?? row.payload?.session_id) !== match[2]) return undefined;
    return { id: match[2], home: match[1], file: normalized };
  } catch { return undefined; }
  finally { if (fd !== undefined) fs.closeSync(fd); }
}
/** Exact identity only. Duplicate copies in different profiles require an explicit home. */
export function findCodexRollout(id: string, home?: string): CodexRollout | undefined {
  if (!new RegExp(`^${UUID}$`, 'i').test(id)) return undefined;
  const matches: CodexRollout[] = [];
  for (const base of home ? [home] : codexHomes()) {
    const stack = [path.join(base, 'sessions')];
    let scanned = 0;
    while (stack.length && scanned < 20000) {
      const dir = stack.pop()!;
      let entries: fs.Dirent[];
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
      for (const entry of entries) {
        if (++scanned > 20000) break;
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) stack.push(file);
        else if (entry.isFile() && entry.name.endsWith(`-${id}.jsonl`)) {
          const found = codexRollout(file);
          if (found) matches.push(found);
        }
      }
    }
  }
  return matches.length === 1 ? matches[0] : undefined;
}
/** One bounded asynchronous probe of the verified foreground owners, never their tool descendants. */
export async function probeCodexBindings(pids: number[]): Promise<Map<number, CodexObservation>> {
  const result = new Map<number, CodexObservation>();
  const owners = [...new Set(pids.filter(p => Number.isSafeInteger(p) && p > 0))];
  if (!owners.length) return result;
  const lsof = ['/usr/sbin/lsof', '/usr/bin/lsof'].find(p => fs.existsSync(p)) ?? 'lsof';
  const output = await new Promise<string>(resolve => {
    cp.execFile(lsof, ['-a', '-p', owners.join(','), '-Fpn'], { encoding: 'utf8', timeout: 2000, maxBuffer: 8 * 1024 * 1024 },
      (error, stdout) => resolve(error?.killed ? '' : stdout || ''));
  });
  const candidates = new Map<number, Map<string, CodexBinding>>();
  const homes = new Map<number, Set<string>>();
  let pid = 0;
  for (const line of output.split('\n')) {
    if (line.startsWith('p')) { pid = Number(line.slice(1)); continue; }
    if (!owners.includes(pid) || !line.startsWith('n')) continue;
    const database = line.slice(1).match(/^(.*)[/\\]state_\d+\.sqlite(?:-(?:shm|wal))?$/);
    if (database) { const values = homes.get(pid) ?? new Set<string>(); values.add(database[1]); homes.set(pid, values); }
    const found = codexRollout(line.slice(1));
    if (!found) continue;
    const choices = candidates.get(pid) ?? new Map<string, CodexBinding>();
    choices.set(`${found.home}\0${found.id}`, { id: found.id, home: found.home });
    candidates.set(pid, choices);
  }
  for (const [owner, values] of homes) if (values.size === 1) result.set(owner, { home: [...values][0] });
  for (const [owner, choices] of candidates) if (choices.size === 1) result.set(owner, [...choices.values()][0]);
  return result;
}
export function shellQuote(value: string): string { return "'" + value.replace(/'/g, "'\\''") + "'"; }
