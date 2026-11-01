/** Codex publishes a braille spinner in its OSC title only while a turn is active.
 * Idle prompt animations, scrollback, and arbitrary terminal output are NOT work signals.
 * Require a verified foreground agent too: a shell can retain a departed agent's title.
 * Unknown agents/title formats deliberately stay at their attachment color.
 */
const CODEX_BUSY_TITLE = /^[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏] /u;

export function isAgentWorking(command: string, title: string): boolean {
  return /^codex(?:\.exe)?$/i.test(command) && CODEX_BUSY_TITLE.test(title);
}

/** Strip runtime decoration for exact conversation-name matching, never shorten names. */
export function codexConversationTitle(title: string): string {
  return title.replace(CODEX_BUSY_TITLE, '').replace(/^\[ ! \] Action Required \| /, '');
}

/** One shared OS snapshot supplies both process ownership and the existing RAM tally.
 * `comm` is the executable name/path, never argv (which may contain prompts/secrets).
 */
export interface PaneProcess {
  pid: string;
  ppid: string;
  pgid: string;
  tpgid: string;
  tty: string;
  state: string;
  rssKB: number;
  command: string;
  startTime?: string; // UTC, C-locale ps lstart; rejects reused PIDs in native status records
}

export function parseProcessSnapshot(raw: string): Map<string, PaneProcess> {
  const processes = new Map<string, PaneProcess>();
  for (const line of raw.split('\n')) {
    const match = line.trim().match(/^(\d+)\s+(\d+)\s+(\d+)\s+(-?\d+)\s+(\S+)\s+(\S+)\s+(\d+)\s+(.+)$/);
    if (!match) continue;
    const [, pid, ppid, pgid, tpgid, tty, state, rss, rest] = match;
    const dated = rest.match(/^([A-Za-z]{3}\s+[A-Za-z]{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\s+\d{4})\s+(.+)$/);
    processes.set(pid, { pid, ppid, pgid, tpgid, tty, state, rssKB: Number(rss),
      command: dated ? dated[2] : rest, startTime: dated?.[1].replace(/\s+/g, ' ') });
  }
  return processes;
}

/** tmux can name zsh instead of Codex when both share the foreground process group
 * (our noninteractive launch wrapper). Verify the live descendant on the pane's
 * own TTY and foreground group. Never accept unrelated/background/headless agents,
 * a retained title after exit, or a Codex tool nested below a different agent.
 */
export function foregroundAgent(
  panePid: string, paneTty: string, processes: Map<string, PaneProcess>,
  children?: Map<string, string[]>,
): string | undefined {
  return foregroundAgentDetails(panePid, paneTty, processes, children)?.name;
}

export interface ForegroundAgent {
  name: 'codex' | 'claude';
  process: PaneProcess;
}

export function foregroundAgentDetails(
  panePid: string, paneTty: string, processes: Map<string, PaneProcess>,
  children?: Map<string, string[]>,
): ForegroundAgent | undefined {
  const tty = paneTty.replace(/^\/dev\//, '');
  const root = processes.get(panePid);
  if (!tty || tty === '?' || tty === '??' || !root || root.tty !== tty || Number(root.tpgid) <= 0) return undefined;
  if (!children) {
    children = new Map<string, string[]>();
    for (const process of processes.values()) {
      const siblings = children.get(process.ppid) ?? [];
      siblings.push(process.pid);
      children.set(process.ppid, siblings);
    }
  }
  const seen = new Set<string>();
  const queue = [panePid];
  for (let i = 0; i < queue.length; i++) {
    const pid = queue[i];
    if (seen.has(pid)) continue;
    seen.add(pid);
    const process = processes.get(pid);
    if (!process || process.tty !== tty) continue;
    const name = process.command.split(/[\\/]/).pop() ?? '';
    // Stop at the owning agent; its tool subprocesses cannot establish UI state.
    if (/^(?:codex(?:\.exe)?|claude|grok|agy|\d+\.\d+\.\d+)$/i.test(name)) {
      const agent = /^codex(?:\.exe)?$/i.test(name) ? 'codex'
        : /^(?:claude|\d+\.\d+\.\d+)$/i.test(name) ? 'claude' : undefined;
      if (agent && process.pgid === root.tpgid &&
          process.tpgid === root.tpgid && !/[TZtX]/.test(process.state)) return { name: agent, process };
      continue;
    }
    queue.push(...(children.get(pid) ?? []));
  }
  return undefined;
}
