import { codexHomes } from './codex-profile';
import * as fs from 'fs';
import { codexConversationTitle } from './working-status';
import * as cp from 'child_process';
import { resolveCommand } from './recap-providers';

/** Read-only app-server protocol, verified against the installed CLI's generated types.
 * Modern Codex stores paginated history without a rollout file or an open JSONL fd.
 * A private stdio server reads that history; it never resumes a thread or starts a turn.
 */
export interface CodexThread { id: string; name: string | null; cwd: string; updatedAt: number; historyMode?: string; codexHome?: string }
interface Page<T> { data: T[]; nextCursor?: string | null }
interface ItemEntry { item: { id: string; type: string; text?: string; content?: Array<{ type: string; text?: string }> } }
const threads = new Map<string, CodexThread>();
let command = 'codex';
let refreshing: Promise<void> | undefined;
let refreshedAt = 0;
export function configureCodexHistory(cli: string): void { command = cli; }
export function cachedCodexThread(id: string, home?: string): CodexThread | undefined {
  const found = [...threads.values()].filter(t => t.id === id && (!home || t.codexHome === home));
  return found.length === 1 ? found[0] : undefined;
}

export class CodexReader {
  private child: cp.ChildProcessWithoutNullStreams;
  private seq = 0;
  private closed = false;
  private buffer = '';
  private pending = new Map<number, { resolve: (r: any) => void; reject: (e: Error) => void; timer: NodeJS.Timeout }>();
  constructor(cli = command, home?: string) {
    this.child = cp.spawn(resolveCommand(cli), ['app-server', '--stdio'], { stdio: 'pipe', env: home ? { ...process.env, CODEX_HOME: home } : process.env });
    this.child.stderr.resume(); // never persist runtime logs or source conversation text
    this.child.stdout.setEncoding('utf8');
    this.child.stdout.on('data', (chunk: string) => {
      this.buffer += chunk;
      if (this.buffer.length > 16 * 1024 * 1024) { this.close(); return; }
      let end: number;
      while ((end = this.buffer.indexOf('\n')) >= 0) {
        const line = this.buffer.slice(0, end); this.buffer = this.buffer.slice(end + 1);
        try {
          const row = JSON.parse(line); const req = this.pending.get(row.id);
          if (!req) continue;
          clearTimeout(req.timer); this.pending.delete(row.id);
          if (row.error) req.reject(new Error('Codex history request failed'));
          else req.resolve(row.result);
        } catch { /* ignore non-protocol lines */ }
      }
    });
    this.child.on('error', () => this.close());
    this.child.on('exit', () => this.close());
    this.child.stdin.on('error', () => this.close());
  }
  request<T>(method: string, params: unknown): Promise<T> {
    // Keep this integration incapable of mutating chats through an accidental caller.
    if (!['initialize', 'thread/list', 'thread/read', 'thread/items/list'].includes(method)) return Promise.reject(new Error('Read-only Codex history method required'));
    if (this.closed) return Promise.reject(new Error('Codex history reader closed'));
    const id = ++this.seq;
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('Codex history request timed out')); }, 8000);
      this.pending.set(id, { resolve, reject, timer });
      this.child.stdin.write(JSON.stringify({ id, method, params }) + '\n');
    });
  }
  async initialize(): Promise<void> {
    await this.request('initialize', { clientInfo: { name: 'persistent_terminal_tabs', version: '1.2.2' }, capabilities: { experimentalApi: true } });
    this.child.stdin.write(JSON.stringify({ method: 'initialized' }) + '\n');
  }
  close(): void {
    this.closed = true;
    for (const req of this.pending.values()) { clearTimeout(req.timer); req.reject(new Error('Codex history reader closed')); }
    this.pending.clear();
    if (!this.child.killed) this.child.kill();
  }
}

/** Shared, bounded metadata refresh. No newest-by-cwd identity guessing. */
export function refreshCodexThreads(force = false): Promise<void> {
  if (refreshing) return refreshing;
  if (!force && Date.now() - refreshedAt < 30000) return Promise.resolve();
  refreshedAt = Date.now();
  refreshing = (async () => {
    const homes = codexHomes().filter(home => fs.existsSync(home));
    for (const home of homes.length ? homes : [undefined]) {
    const reader = new CodexReader(command, home);
    try {
      await reader.initialize();
      const fresh = new Map<string, CodexThread>();
      let cursor: string | undefined;
      for (let page = 0; page < 50; page++) {
        const result = await reader.request<Page<CodexThread>>('thread/list', { limit: 100, cursor, useStateDbOnly: true, sortKey: 'updated_at' });
        for (const thread of result.data) fresh.set(`${home ?? ""}\0${thread.id}`, { ...thread, codexHome: home });
        if (!result.nextCursor) break;
        cursor = result.nextCursor;
      }
      for (const [key, thread] of threads) if (thread.codexHome === home) threads.delete(key);
      for (const [key, thread] of fresh) threads.set(key, thread);
    } catch { /* A missing profile never suppresses other profiles. */ } finally { reader.close(); }
    }
  })().finally(() => { refreshing = undefined; });
  return refreshing;
}

/** Only a complete unique TUI footer or OSC terminal title qualifies. Truncation/duplicate names stay unbound. */
export function matchCodexScreen(screen: string, candidates: Iterable<CodexThread> = threads.values(), paneTitle = '', home?: string): CodexThread | undefined {
  paneTitle = codexConversationTitle(paneTitle);
  const footer = screen.split('\n').slice(-8).map(x => x.trim()).filter(x => /(?:GPT-|gpt-|o[134][ -]).* · /.test(x));
  const matches = [...candidates].filter(t => (!home || t.codexHome === home) && t.name && (footer.some(line => line.endsWith(` · ${t.name}`)) || paneTitle === t.name || paneTitle.startsWith(`${t.name} | `)));
  return matches.length === 1 ? matches[0] : undefined;
}

export async function codexConversation(id: string, home?: string): Promise<{ thread: CodexThread; messages: Array<{ role: string; text: string }> }> {
  home ??= cachedCodexThread(id)?.codexHome;
  const reader = new CodexReader(command, home);
  try {
    await reader.initialize();
    const { thread } = await reader.request<{ thread: CodexThread }>('thread/read', { threadId: id, includeTurns: false });
    threads.set(`${home ?? ""}\0${thread.id}`, { ...thread, codexHome: home });
    const first = await reader.request<Page<ItemEntry>>('thread/items/list', { threadId: id, limit: 30, sortDirection: 'asc' });
    const recent: ItemEntry[] = [];
    let cursor: string | undefined;
    for (let n = 0; n < 10; n++) {
      const page = await reader.request<Page<ItemEntry>>('thread/items/list', { threadId: id, limit: 100, sortDirection: 'desc', cursor });
      recent.push(...page.data);
      if (recent.filter(x => ['userMessage', 'agentMessage'].includes(x.item.type)).length >= 16 || !page.nextCursor) break;
      cursor = page.nextCursor;
    }
    const seen = new Set<string>();
    const messages = [...first.data, ...recent.reverse()].flatMap(({ item }) => {
      if (seen.has(item.id)) return []; seen.add(item.id);
      if (item.type === 'agentMessage') return [{ role: 'assistant', text: item.text ?? '' }];
      if (item.type === 'userMessage') return [{ role: 'user', text: (item.content ?? []).filter(x => x.type === 'text').map(x => x.text ?? '').join(' ') }];
      return [];
    });
    return { thread, messages };
  } finally { reader.close(); }
}
