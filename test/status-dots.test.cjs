const {test} = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const original = Module._load;
Module._load = function(name, ...args) {
  if (name === 'vscode') return {
    EventEmitter: class {event=()=>{}; fire(){}},
    TreeItem: class {constructor(label){this.label=label;}},
    ThemeIcon: class {constructor(id,color){this.id=id;this.color=color;}},
    ThemeColor: class {constructor(id){this.id=id;}},
    MarkdownString: class {appendMarkdown(){}},
    TreeItemCollapsibleState:{None:0}
  };
  return original.call(this,name,...args);
};
const {TabsTree} = require('../out/tree');
Module._load=original;

test('status dot renders blue working, green attached, yellow detached, grey suspended', () => {
  let open=false, alive=false, working=false;
  const tree=new TabsTree({meta:()=>({title:'test'}),groups:[]},()=>open,()=>{},()=>alive,()=>working);
  const item=()=>tree.getTreeItem({kind:'tab',id:'test',group:'group'}).iconPath;
  assert.equal(item().id,'circle-outline');
  working=true;
  assert.equal(item().color,undefined,'no process must never show blue');
  alive=true;
  assert.equal(item().color.id,'charts.blue');
  working=false;
  assert.equal(item().color.id,'charts.yellow');
  open=true;
  assert.equal(item().color.id,'charts.green');
  working=true;
  assert.equal(item().color.id,'charts.blue');
});

test('activation retains verified attached terminals and paints native work transitions without reopening sessions', () => {
  const cp = require('node:child_process');
  const result = cp.spawnSync(process.execPath, ['-e', String.raw`
    const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),Module=require('node:module');
    const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ptt-activation-'));
    os.homedir=()=>tmp;
    global.setTimeout=()=>0; global.setInterval=()=>0;
    const {StateStore,workspaceStatePath}=require('./out/state');
    const ids=['live0001-session','idle0002-session',...Array.from({length:8},(_,i)=>'cold000'+i+'-session')];
    const store=new StateStore(workspaceStatePath(tmp),tmp,{groups:[{name:'Test',sessionIds:ids}],sessions:Object.fromEntries(ids.map(id=>[id,{title:id,cwd:tmp,agent:'claude'}]))});
    store.save();
    let destroyed=0,launched=0,provider,working=true,attached=true;
    const terminals=[{name:'Claude',processId:Promise.resolve(500),dispose(){destroyed++}},
      {name:'Claude stale duplicate',processId:Promise.resolve(999),dispose(){destroyed++}}];
    const handlers=new Map(),d={dispose(){}};
    const vscode={extensions:{getExtension:()=>undefined},EventEmitter:class{event=()=>d;fire(){}},
      TreeItem:class{constructor(label){this.label=label}},ThemeIcon:class{constructor(id,color){this.id=id;this.color=color}},
      ThemeColor:class{constructor(id){this.id=id}},MarkdownString:class{appendMarkdown(){}},TreeItemCollapsibleState:{None:0},
      StatusBarAlignment:{Right:1},Uri:{file:fsPath=>({fsPath,scheme:'file'}),parse:s=>({toString:()=>s})},
      workspace:{workspaceFolders:[{uri:{scheme:'file',fsPath:tmp}}],getConfiguration:()=>({get:(key,fallback)=>key==='autoSuspendHours'?0:fallback})},
      commands:{registerCommand:(id,fn)=>{handlers.set(id,fn);return d},executeCommand:async()=>{}},
      window:{terminals,createOutputChannel:()=>({appendLine(){},show(){}}),createStatusBarItem:()=>({show(){}}),
        createTreeView:(id,opts)=>{provider=opts.treeDataProvider;return{selection:[],onDidChangeSelection:()=>d}},
        registerFileDecorationProvider:()=>d,onDidOpenTerminal:()=>d,onDidCloseTerminal:()=>d,
        showInformationMessage(){},createTerminal(){launched++;throw Error('must not launch')}}};
    const snapshot=()=>[{id:'live0001',name:'tt-live0001',attached,working,command:'claude',title:'✳ static',agentCommand:'claude',claudeStatus:working?'busy':'idle',ramMB:1,activitySec:1},
      {id:'idle0002',name:'tt-idle0002',attached:false,working:false,command:'claude',title:'✳ static',ramMB:1,activitySec:1}];
    const real=Module._load;
    Module._load=function(name,...args){
      if(name==='vscode')return vscode;
      if(name==='./codex-history')return{configureCodexHistory(){},refreshCodexThreads:async()=>{}};
      if(name==='./tmux')return{tmuxAvailable:()=>true,applyTmuxConf(){},listSessions:snapshot,attachedClientSessions:()=>new Map([[500,'live0001']]),tmuxDiag:()=>'',hasTranscript:()=>false};
      if(name==='./sessions')return{transcriptCwds:()=>new Map()};
      return real.call(this,name,...args);
    };
    (async()=>{try{
      const ext=require('./out/extension');await ext.activate({subscriptions:[]});
      assert.equal(destroyed,1,'only unverified stray is disposed');assert.equal(launched,0,'no cold or detached session is launched');
      const color=id=>provider.getTreeItem({kind:'tab',id,group:'Test'}).iconPath.color?.id;
      assert.equal(color(ids[0]),'charts.blue');
      working=false;handlers.get('terminalTabs.diagDots')();assert.equal(color(ids[0]),'charts.green');
      assert.equal(color(ids[1]),'charts.yellow');
      working=true;handlers.get('terminalTabs.diagDots')();assert.equal(color(ids[0]),'charts.blue');
      ext.deactivate();
    }finally{fs.rmSync(tmp,{recursive:true,force:true})}})().catch(e=>{console.error(e);process.exitCode=1});
  `], { cwd: require('node:path').join(__dirname,'..'),encoding:'utf8',timeout:10000 });
  assert.equal(result.status,0,result.stderr || result.stdout);
});


test('unknown and waiting remain visibly distinct without changing attachment colors', () => {
  let state='unknown',attached=true,alive=true;
  const tree=new TabsTree({meta:()=>({title:'app'}),groups:[]},()=>attached,()=>{},()=>alive,()=>state==='working',()=>({state,source:'test'}));
  const icon=()=>tree.getTreeItem({kind:'tab',id:'test',group:'group'}).iconPath;
  assert.equal(icon().id,'question');assert.equal(icon().color.id,'charts.green');
  attached=false;assert.equal(icon().id,'question');assert.equal(icon().color.id,'charts.yellow');
  state='waiting';assert.equal(icon().id,'bell');assert.equal(icon().color.id,'charts.yellow');
  state='idle';assert.equal(icon().id,'circle-filled');
  state='working';assert.equal(icon().color.id,'charts.blue');
  alive=false;assert.equal(icon().id,'circle-outline');assert.equal(icon().color,undefined);
});
