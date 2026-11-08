import { PaneProcess, isAgentWorking } from './working-status';
import { ClaudeStatus } from './claude-status';

export type AgentState = 'working' | 'waiting' | 'idle' | 'unknown';
export interface AgentStatus { state: AgentState; source: string; }
export interface StatusContext {
  agent?: string;
  owner?: PaneProcess;
  title: string;
  claude?: ClaudeStatus;
  reported?: AgentStatus;
}
export interface StatusAdapter { id: string; read(context: StatusContext): AgentState | undefined; }
export const UNKNOWN_STATUS: AgentStatus = { state: 'unknown', source: 'unavailable' };

// One contract for every application, independent of its selected/cloud/local model.
// Adapters supply evidence; attachment, polling and presentation live elsewhere.
export const nativeAdapters: readonly StatusAdapter[] = [
  // Grok 1.0.70 retains turn.started_at_ms and can omit Stop on user cancellation.
  // Gate until its complete lifecycle passes; never promote that known-stale evidence.
  { id: 'grok-unverified', read: c => c.agent === 'grok' ? 'unknown' : undefined },
  { id: 'claude-native', read: c => c.agent !== 'claude' ? undefined
    : c.claude === 'busy' ? 'working' : c.claude === 'waiting' ? 'waiting' : c.claude === 'idle' ? 'idle' : 'unknown' },
  { id: 'codex-title', read: c => c.agent !== 'codex' ? undefined
    : isAgentWorking('codex', c.title) ? 'working'
    : /^(?:● )?\[ [!.] \] Action Required(?: \| |$)/u.test(c.title) ? 'waiting'
    // The default activity item disappears when idle; the thread/project title remains.
    // Also accept explicit run-state titles. Unknown/empty formats must not imply idle.
    : /^(?:Working|Thinking|Waiting) \| /u.test(c.title) ? 'working'
    : /^Ready(?: \| |$)/u.test(c.title) ? 'idle'
    : /^(?:Starting|●)(?: |$)/u.test(c.title) ? 'unknown'
    : /^\S[^\r\n]* \| \S[^\r\n]*$/u.test(c.title) ? 'idle' : 'unknown' },
  { id: 'gemini-title', read: c => c.agent !== 'gemini' ? undefined
    : /^(?:✦ {2}|⏲ {2}Working…)/u.test(c.title) ? 'working' : /^✋\uFE0F? {2}Action Required/u.test(c.title) ? 'waiting'
    : /^◇ {2}Ready/u.test(c.title) ? 'idle' : 'unknown' },
];

export function resolveAgentStatus(context: StatusContext, adapters = nativeAdapters): AgentStatus {
  if (!context.owner || /[TZtX]/.test(context.owner.state)) return UNKNOWN_STATUS;
  for (const adapter of adapters) {
    const state = adapter.read(context);
    if (state !== undefined) return { state, source: adapter.id };
  }
  return context.reported ?? UNKNOWN_STATUS;
}
