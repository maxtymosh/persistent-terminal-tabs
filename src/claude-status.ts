import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { PaneProcess } from './working-status';

export type ClaudeStatus = 'busy' | 'idle' | 'waiting';

/** Claude's native registry also backs `claude agents --json`. Read only the
 * exact foreground PID's public JSON, never its adjacent authentication .key.
 * Status changes are event-driven, NOT heartbeats: a long tool/delegated task
 * can legitimately stay busy for hours. Identity, not file age, rejects stale data.
 */
export function claudeStatus(
  owner: PaneProcess, tmuxName: string,
  configDir = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude'),
): ClaudeStatus | undefined {
  if (!/^\d+$/.test(owner.pid) || !owner.startTime) return undefined;
  try {
    const file = path.join(configDir, 'sessions', `${owner.pid}.json`);
    if (fs.statSync(file).size > 64 * 1024) return undefined;
    return validateClaudeStatus(JSON.parse(fs.readFileSync(file, 'utf8')), owner, tmuxName);
  } catch { return undefined; } // absent/partial/unsupported registry: never retain cached blue
}

export function validateClaudeStatus(value: unknown, owner: PaneProcess, tmuxName: string): ClaudeStatus | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  if (record.pid !== Number(owner.pid) || record.kind !== 'interactive' ||
      typeof record.sessionId !== 'string' || !record.sessionId ||
      !owner.startTime || typeof record.procStart !== 'string' ||
      record.procStart.trim().replace(/\s+/g, ' ') !== owner.startTime ||
      typeof record.tmux !== 'string' || record.tmux.split(':')[0] !== tmuxName) return undefined;
  return record.status === 'busy' || record.status === 'idle' || record.status === 'waiting'
    ? record.status : undefined;
}
