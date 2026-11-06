import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const INITIALIZED = 'terminalTabs.defaultViewLocation.v1';
const MOVE_VIEWS = 'vscode.moveViews';

/** Older releases did not write an extension Memento. Their saved slices identify an upgrade. */
export function hasExistingPttState(home = os.homedir()): boolean {
  const root = path.join(home, '.terminal-tabs');
  return fs.existsSync(path.join(root, 'state.json')) || fs.existsSync(path.join(root, 'workspaces'));
}

/** Use VS Code's own drag/drop operation: this shares the Terminal container, not a separate panel tab.
 * This built-in command exists in the minimum supported VS Code 1.85; retain a fallback if unavailable. */
export async function dockBesideTerminal(): Promise<boolean> {
  if (!(await vscode.commands.getCommands(true)).includes(MOVE_VIEWS)) return false;
  await vscode.commands.executeCommand(MOVE_VIEWS, {
    viewIds: ['terminalTabs.tree'],
    destinationId: 'workbench.panel.terminal',
  });
  return true;
}

/** Apply the default once per local profile. After that VS Code owns the user's view placement.
 * Missing persistence is a reason to stay passive, never to move the view on every activation. */
export async function initializeViewLocation(
  state: vscode.Memento | undefined,
  upgrading: boolean,
): Promise<'unchanged' | 'preserved' | 'docked' | 'unavailable' | 'failed'> {
  if (!state || state.get<boolean>(INITIALIZED)) return 'unchanged';
  try {
    // Mark before moving so reloads, failures or later manual moves cannot cause repeated layout changes.
    await state.update(INITIALIZED, true);
    if (upgrading) return 'preserved';
    return await dockBesideTerminal() ? 'docked' : 'unavailable';
  } catch {
    return 'failed'; // the explicit Dock Beside Terminal command remains available for recovery
  }
}
