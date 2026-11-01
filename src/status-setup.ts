/** Explicit, reversible install of the generic reporter and passive Gemini registration. */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
const quote = (s: string): string => "'" + s.replace(/'/g, "'\\''") + "'";
export function grokHooks(command: string): object {
  return { hooks: Object.fromEntries(['SessionStart','UserPromptSubmit','PreToolUse','PostToolUse','PostToolUseFailure',
    'Stop','StopFailure','StopCancelled','SessionEnd','Notification','PreCompact','PostCompact'].map(event =>
    [event, [{ hooks: [{ type: 'command', command: `${command} hook grok`, timeout: 5 }] }]])) };
}
export function geminiSettings(settings: any, command: string): any {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) throw Error('Invalid Gemini settings object');
  const hooks = settings.hooks ?? {};
  if (typeof hooks !== 'object' || Array.isArray(hooks) || !Array.isArray(hooks.SessionStart ?? [])) throw Error('Invalid Gemini hooks');
  const other = (hooks.SessionStart ?? []).map((group: any) => ({ ...group,
    hooks: (group.hooks ?? []).filter((hook: any) => hook.name !== 'ptt-status-register') })).filter((group: any) => group.hooks.length);
  return { ...settings, hooks: { ...hooks, SessionStart: [...other,
    { hooks: [{ name: 'ptt-status-register', type: 'command', command: `${command} hook gemini`, timeout: 5000 }] }] } };
}
export function installStatusBridge(home = os.homedir(), node = process.execPath): string {
  const directory = path.join(home, '.terminal-tabs', 'status-bridge');
  const geminiFile = path.join(process.env.GEMINI_CLI_HOME || home, '.gemini', 'settings.json');
  // Parse before touching anything. Never replace a malformed/JSONC configuration.
  const original = fs.existsSync(geminiFile) ? fs.readFileSync(geminiFile, 'utf8') : undefined;
  const launcher = path.join(directory, 'ptt-status');
  const settings = geminiSettings(original === undefined ? {} : JSON.parse(original), quote(launcher));
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const runtime = path.join(directory, `runtime-${Date.now()}-${process.pid}`);
  fs.mkdirSync(runtime, { mode: 0o700 });
  for (const module of ['status-reporter','status-record','agent-status','working-status']) {
    fs.copyFileSync(path.join(__dirname, `${module}.js`), path.join(runtime, `${module}.js`));
  }
  const nextLauncher = `${launcher}.${process.pid}.tmp`;
  fs.writeFileSync(nextLauncher, `#!/bin/sh\nexec ${quote(node)} ${quote(path.join(runtime, 'status-reporter.js'))} "$@"\n`, { mode: 0o700 });
  fs.renameSync(nextLauncher, launcher);
  const backup = path.join(directory, 'backups', String(Date.now())); fs.mkdirSync(backup, { recursive: true, mode: 0o700 });
  for (const [file, old, value] of [[geminiFile, original, settings]] as const) {
    if ((fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : undefined) !== old) throw Error('Configuration changed concurrently');
    if (old !== undefined) fs.writeFileSync(path.join(backup, 'gemini-settings.json'), old, { mode: 0o600 });
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const temp = `${file}.ptt-${process.pid}.tmp`;
    fs.writeFileSync(temp, JSON.stringify(value, null, 2) + '\n', { mode: 0o600 }); fs.renameSync(temp, file);
  }
  return launcher;
}
if (require.main === module) {
  try { console.log(`Installed passive status bridge: ${installStatusBridge()}`); }
  catch { console.error('Status setup failed; check configuration syntax and concurrent edits. Existing files were not blindly replaced.'); process.exitCode = 1; }
}
