const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

test('uncombine preserves live shells, native order and saved separate layout; Combine reverses it', () => {
  const result = spawnSync(process.execPath, ['-e', String.raw`
    const assert = require('node:assert/strict');
    const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), Module = require('node:module');
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ptt-layout-'));
    os.homedir = () => tmp;
    global.setTimeout = () => 0; global.setInterval = () => 0;
    const { StateStore, workspaceStatePath } = require('./out/state');
    const ids = ['first001-chat', 'second02-chat', 'third003-chat', 'closed04-chat'];
    const large = Array.from({length:13}, (_, i) => 'large-' + i);
    const store = new StateStore(workspaceStatePath(tmp), tmp, {
      groups: [{name:'Test',cwd:tmp,sessionIds:ids}, {name:'Other',sessionIds:['other005-chat']},
        {name:'Large',layout:'separate',sessionIds:large}, {name:'Empty',sessionIds:[]}],
      sessions: Object.fromEntries([...ids, 'other005-chat', ...large].map(id => [id, {title:id,cwd:tmp,project:'test'}]))
    });
    store.save();
    const read = () => StateStore.forWorkspace(tmp);
    const handlers = new Map(), terminals = [], nativeGroups = [], unsplitTargets = [];
    let created = 0, disposed = 0;
    const d = {dispose(){}};
    const vscode = {
      extensions:{getExtension:()=>undefined}, EventEmitter:class{event=()=>d;fire(){}},
      StatusBarAlignment:{Right:1}, Uri:{file:fsPath=>({fsPath,scheme:'file'}),parse:s=>({toString:()=>s})},
      workspace:{workspaceFolders:[{uri:{scheme:'file',fsPath:tmp}}],
        getConfiguration:()=>({get:(key,fallback)=>['useTmux','openOnStartup'].includes(key)?false:key==='autoSuspendHours'?0:fallback})},
      commands:{registerCommand:(id,fn)=>{handlers.set(id,fn);return d},
        executeCommand:async(id)=>{
          if(id!=='workbench.action.terminal.unsplit') return;
          // Model VS Code's native operation: remove one pane and append a standalone group, retaining the terminal.
          const terminal = vscode.window.activeTerminal;
          unsplitTargets.push(terminal);
          const group = nativeGroups.find(g=>g.includes(terminal));
          assert.ok(group, 'unsplit must target a live terminal');
          if(group.length>1){group.splice(group.indexOf(terminal),1);nativeGroups.push([terminal]);}
        }},
      window:{terminals,createOutputChannel:()=>({appendLine(){},show(){},dispose(){}}),
        createStatusBarItem:()=>({show(){},dispose(){}}),
        createTreeView:()=>({selection:[{kind:'group',name:'Test'}],onDidChangeSelection:()=>d,dispose(){}}),
        registerFileDecorationProvider:()=>d,onDidOpenTerminal:()=>d,onDidCloseTerminal:()=>d,
        showWarningMessage:async()=>undefined,
        createTerminal:(options)=>{
          created++;
          const terminal={options,name:options.name,show(){vscode.window.activeTerminal=terminal},sendText(){},
            dispose(){
              disposed++;
              terminals.splice(terminals.indexOf(terminal),1);
              const g=nativeGroups.find(g=>g.includes(terminal));
              g.splice(g.indexOf(terminal),1);
              if(!g.length)nativeGroups.splice(nativeGroups.indexOf(g),1);
            }};
          terminals.push(terminal);
          const parent=options.location?.parentTerminal;
          if(parent){const g=nativeGroups.find(g=>g.includes(parent));g.splice(g.indexOf(parent)+1,0,terminal);}
          else nativeGroups.push([terminal]);
          return terminal;
        }}
    };
    const real = Module._load;
    Module._load = function(name, ...args) {
      if(name==='vscode') return vscode;
      if(name==='./codex-history') return {configureCodexHistory(){},refreshCodexThreads:async()=>{}};
      return real.call(this,name,...args);
    };
    const extension = require('./out/extension');
    const call = (name,node={kind:'group',name:'Test'}) => handlers.get('terminalTabs.'+name)(node);
    (async()=>{try{
      await extension.activate({subscriptions:[]});
      for(const id of ids.slice(0,3)) await call('openTab',{kind:'tab',id,group:'Test'});
      await call('openTab',{kind:'tab',id:'other005-chat',group:'Other'});
      const original = terminals.slice(0,3), unrelated = terminals[3];
      const originalSessions = read().sessions;
      original[1].show();
      assert.deepEqual(nativeGroups[0],original);
      await call('uncombineGroup');
      assert.equal(created,4,'uncombine must not launch closed chats or replace shells');
      assert.equal(disposed,0,'plain shells must survive too');
      assert.deepEqual(nativeGroups.filter(g=>g.some(t=>original.includes(t))),original.map(t=>[t]),'retain pane order');
      assert.ok(unsplitTargets.every(t=>original.includes(t)),'never unsplit another group');
      assert.equal(vscode.window.activeTerminal,original[1],'restore previously focused group chat');
      assert.equal(read().groups.find(g=>g.name==='Test').layout,'separate','persist across store reload');
      assert.deepEqual(read().groups.find(g=>g.name==='Test').sessionIds,ids,'keep panel membership and order');
      assert.deepEqual(read().sessions,originalSessions,'keep session identities, titles and working folders');
      await call('uncombineGroup');
      assert.equal(disposed,0,'repeated uncombine is harmless');
      const before=created;
      await call('openGroup');
      assert.equal(created,before+1,'explicit group open opens the remaining closed chat');
      assert.equal(terminals.at(-1).options.location,undefined,'reopen stays separate');
      assert.equal(disposed,0,'opening a separate group keeps existing shells');
      await call('newChatInGroup');
      assert.equal(terminals.at(-1).options.location,undefined,'new chats stay separate');
      await call('combineGroup');
      assert.equal(read().groups.find(g=>g.name==='Test').layout,'split');
      assert.ok(terminals.includes(unrelated),'combine leaves other groups untouched');
      const combined=nativeGroups.find(g=>g.length===5);
      assert.ok(combined,'Combine must rebuild a single split even though separate terminals were contiguous');
      assert.deepEqual(combined.slice(0,4).map(t=>t.name),ids.map(id=>'Claude · '+id));
      await call('newChatInGroup');
      assert.equal(terminals.at(-1).options.location.parentTerminal,combined.at(-2),'new chats split again');
      await call('uncombineGroup');
      const second=created;
      await call('openGroup');
      assert.equal(created,second,'group click must not recombine an already-open separate group');
      await call('combineGroup',{kind:'group',name:'Large'});
      assert.equal(read().groups.find(g=>g.name==='Large').layout,'separate','cancel Combine preserves separate layout');
      assert.equal(created,second,'cancel must not open dormant chats');
      await call('uncombineGroup',{kind:'group',name:'Empty'});
      assert.equal(created,second,'empty group is a safe no-op');
      assert.equal(read().groups.find(g=>g.name==='Empty').layout,'separate');
      await call('combineGroup',{kind:'group',name:'Empty'});
      assert.equal(read().groups.find(g=>g.name==='Empty').layout,'split','empty groups can switch back too');
      await call('uncombineGroup',{kind:'group',name:'missing'});
      assert.equal(read().groups.some(g=>g.name==='missing'),false);
      await handlers.get('terminalTabs.uncombineGroup')(); // Command Palette uses selected group.
      extension.deactivate();
    }finally{fs.rmSync(tmp,{recursive:true,force:true});}})().catch(error=>{console.error(error);process.exitCode=1});
  `], {cwd:path.join(__dirname,'..'),encoding:'utf8',timeout:15000});
  assert.equal(result.status,0,result.stderr || result.stdout);
});

test('Uncombine is available on the group row, context menu and Command Palette', () => {
  const { contributes } = require('../package.json');
  assert.ok(contributes.commands.some(c=>c.command==='terminalTabs.uncombineGroup' && c.icon));
  const actions=contributes.menus['view/item/context'].filter(c=>c.command==='terminalTabs.uncombineGroup');
  assert.ok(actions.some(c=>c.group.startsWith('inline')));
  assert.ok(actions.some(c=>!c.group.startsWith('inline')));
  assert.ok(actions.every(c=>c.when.includes('viewItem == group')));
});
