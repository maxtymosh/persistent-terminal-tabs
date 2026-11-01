import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { PaneProcess } from './working-status';
import { AgentState } from './agent-status';

export interface StatusRecord {
  schema: 1; pid: string; startTime: string; tmux: string;
  application: string; session: string; state: AgentState; updated: number;
}
export function statusDirectory(): string { return path.join(os.homedir(), '.terminal-tabs', 'agent-status'); }
export function validRecord(value: unknown, owner: PaneProcess, tmux: string): value is StatusRecord {
  if (!value || typeof value !== 'object') return false;
  const r = value as StatusRecord;
  return r.schema === 1 && r.pid === owner.pid && !!owner.startTime && r.startTime === owner.startTime &&
    r.tmux === tmux && /^[a-z][a-z0-9-]{0,63}$/.test(r.application) &&
    typeof r.session === 'string' && r.session.length > 0 && r.session.length < 256 &&
    ['working', 'waiting', 'idle', 'unknown'].includes(r.state) && Number.isFinite(r.updated);
}
export function readStatusRecord(owner: PaneProcess, tmux: string, directory = statusDirectory()): StatusRecord | undefined {
  if (!/^\d+$/.test(owner.pid)) return undefined;
  try {
    const file = path.join(directory, `${owner.pid}.json`);
    if (fs.statSync(file).size > 8192) return undefined;
    const record = JSON.parse(fs.readFileSync(file, 'utf8'));
    return validRecord(record, owner, tmux) ? record : undefined;
  } catch { return undefined; }
}
export function writeStatusRecord(record: StatusRecord, directory = statusDirectory()): void {
  if (!/^\d+$/.test(record.pid)) throw Error('Invalid process identity');
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const file = path.join(directory, `${record.pid}.json`);
  const temp = `${file}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(temp, JSON.stringify(record), { mode: 0o600 });
    fs.renameSync(temp, file);
  } finally { try { fs.unlinkSync(temp); } catch { /* renamed or not created */ } }
}
