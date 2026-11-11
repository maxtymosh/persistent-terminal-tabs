const { test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// VS Code's documented TreeView.reveal contract: the registered TreeDataProvider "must implement getParent …
// to access this API". The extension host rejects reveal() otherwise, and resolves a fresh element object by
// walking getParent to the root and matching the TreeItem id among that parent's children. A tree-view mock
// whose reveal() always succeeds hides both halves, which is how the newGroup error toast shipped.
function contractTreeView(provider, state) {
  const disposable = { dispose() {} };
  const idOf = async (node) => (await provider.getTreeItem(node)).id;
  return {
    get selection() { return state.selection; },
    onDidChangeSelection: () => disposable,
    dispose() {},
    reveal: async (element, options) => {
      if (state.failReveal) throw state.failReveal;
      if (typeof provider.getParent !== 'function')
        throw new Error("Required registered TreeDataProvider to implement 'getParent' method to access 'reveal' method");
      let parent;
      for (let p = await provider.getParent(element); p; p = await provider.getParent(p)) parent ??= p;
      const wanted = await idOf(element);
      let match;
      for (const row of await provider.getChildren(parent)) if (await idOf(row) === wanted) { match = row; break; }
      if (!match) throw new Error(`Cannot resolve tree item for element ${wanted}`);
      state.revealed.push({ node: match, options });
      state.selection = [match];
    },
  };
}

test('New Group creates the group and reveals its row under the real TreeView.reveal contract', async (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ptt-new-group-reveal-'));
  const originalHome = os.homedir;
  os.homedir = () => temp;
  t.after(() => { os.homedir = originalHome; fs.rmSync(temp, { recursive: true, force: true }); });
  const project = path.join(temp, 'Reels');
  fs.mkdirSync(project);

  const handlers = new Map();
  const terminals = [];
  const logged = [];
  const state = { selection: [], revealed: [], failReveal: undefined };
  let view;
  let choice;
  const disposable = { dispose() {} };
  class TreeItem { constructor(label, collapsibleState) { this.label = label; this.collapsibleState = collapsibleState; } }
  const mock = {
    extensions: { getExtension: () => undefined },
    EventEmitter: class { event = () => disposable; fire() {} },
    StatusBarAlignment: { Right: 1 },
    TreeItem,
    TreeItemCollapsibleState: { None: 0 },
    ThemeIcon: class { constructor(id, color) { this.id = id; this.color = color; } },
    ThemeColor: class { constructor(id) { this.id = id; } },
    MarkdownString: class { appendMarkdown() { return this; } },
    Uri: { file: (fsPath) => ({ fsPath, scheme: 'file' }), parse: (s) => ({ toString: () => s }) },
    workspace: {
      workspaceFolders: [{ uri: { scheme: 'file', fsPath: temp } }],
      getConfiguration: () => ({ get: (key, fallback) => (key === 'useTmux' ? false : fallback) }),
    },
    commands: { registerCommand: (id, fn) => { handlers.set(id, fn); return disposable; }, executeCommand: async () => undefined },
    window: {
      terminals,
      createOutputChannel: () => ({ appendLine(line) { logged.push(line); }, show() {}, dispose() {} }),
      createStatusBarItem: () => ({ show() {}, dispose() {} }),
      createTreeView: (_id, options) => (view = contractTreeView(options.treeDataProvider, state)),
      registerFileDecorationProvider: () => disposable,
      onDidOpenTerminal: () => disposable,
      onDidCloseTerminal: () => disposable,
      showWarningMessage: async () => undefined,
      createTerminal: (options) => {
        const term = { options, name: options.name, show() { mock.window.activeTerminal = term; }, sendText() {}, dispose() {} };
        terminals.push(term);
        return term;
      },
    },
  };
  const original = Module._load;
  Module._load = function (name, ...args) {
    if (name === 'vscode') return mock;
    if (name === './project-picker') return { pickProject: async () => choice };
    if (name === './codex-history') return { configureCodexHistory() {}, refreshCodexThreads: async () => {}, cachedCodexThread: () => undefined };
    return original.call(this, name, ...args);
  };
  const extension = require('../out/extension');
  Module._load = original;
  t.after(() => extension.deactivate());
  await extension.activate({ subscriptions: [] });

  const slices = path.join(temp, '.terminal-tabs', 'workspaces');
  const read = () => JSON.parse(fs.readFileSync(path.join(slices, fs.readdirSync(slices).find((f) => f.endsWith('.json'))), 'utf8'));

  // The reported failure: the folder was created, then the command rejected and VS Code showed an error toast.
  choice = { name: 'Reels', cwd: project };
  await assert.doesNotReject(handlers.get('terminalTabs.newGroup')(), 'creating a group must not surface a command error');
  assert.equal(read().groups[1].name, 'Reels');
  assert.equal(read().groups[1].cwd, project);
  assert.deepEqual(state.revealed.map((r) => r.node), [{ kind: 'group', name: 'Reels' }], 'the new group row is revealed');
  assert.deepEqual(state.revealed[0].options, { select: true, focus: true });
  assert.deepEqual(state.selection, [{ kind: 'group', name: 'Reels' }]);

  // Chat rows are top-level siblings of their group header in this flat tree, so they reveal the same way.
  await handlers.get('terminalTabs.newChatInGroup')({ kind: 'group', name: 'Reels' });
  const id = read().groups[1].sessionIds[0];
  await view.reveal({ kind: 'tab', id, group: 'Reels' });
  assert.deepEqual(state.selection, [{ kind: 'tab', id, group: 'Reels' }]);

  // Reveal is a courtesy after the group is saved. A view that cannot reveal (hidden, mid-refresh, disposed)
  // must not turn a successful creation into "Error running command terminalTabs.newGroup".
  state.failReveal = new Error('Cannot resolve tree item for element group:Reels (2)');
  const before = state.revealed.length;
  await assert.doesNotReject(handlers.get('terminalTabs.newGroup')(), 'a failed reveal is not a failed group creation');
  assert.equal(read().groups[1].name, 'Reels (2)', 'the second group is saved even though its row could not be revealed');
  assert.equal(state.revealed.length, before);
  assert.ok(logged.some((line) => line.includes('Reels (2)') && line.includes('Cannot resolve tree item')), 'the reveal failure is logged, not swallowed');
  assert.ok(logged.some((line) => line.includes('group "Reels (2)" after')), 'the creation is still logged');
  extension.deactivate();
});
