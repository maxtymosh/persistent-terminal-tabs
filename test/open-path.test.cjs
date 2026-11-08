const {test}=require('node:test');
const assert=require('node:assert/strict');
const cp=require('node:child_process');
const path=require('node:path');

const fixture=String.raw`
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),Module=require('node:module');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ptt-open-path-'));os.homedir=()=>tmp;
const scenario=process.env.PTT_OPEN_CASE;
const timers=[];global.setTimeout=(fn,ms)=>{timers.push({fn,ms});return 0};global.setInterval=()=>0;
const ids=Array.from({length:50},(_,i)=>'live'+String(i).padStart(4,'0')+'-chat');
const separate=scenario==='separate-middle'||scenario==='auto-recap';
const {StateStore,workspaceStatePath}=require('./out/state');
new StateStore(workspaceStatePath(tmp),tmp,{groups:[{name:'Test',layout:separate?'separate':'split',sessionIds:ids}],
 sessions:Object.fromEntries(ids.map((id,i)=>[id,{title:'Task '+i,cwd:'/unmounted/ptt-test-project',agent:'codex',codexSessionId:scenario==='auto-recap'&&i===4?undefined:'thread-'+i}]))}).save();
const read=()=>StateStore.forWorkspace(tmp);
let created=0,destroyed=0,coldProbes=0,coldLaunches=0,attaches=0,liveProbes=0,warnings=0,kills=0,closeHandler,providerCount=0,activeProviders=0,maxProviders=0;
const providers=[],terminals=[],nativeGroups=[],handlers=new Map();const d={dispose(){}};
const initial=['auto-recap','live-reattach','attach-failed'].includes(scenario)?[]:ids.filter((id,i)=>scenario==='group-append'?i<49:i!==25);
function makeTerminal(id,pid){
 const t={id,name:'Codex · '+id,processId:Promise.resolve(pid),show(){vscode.window.activeTerminal=t},sendText(){},dispose(){destroyed++;terminals.splice(terminals.indexOf(t),1);const g=nativeGroups.find(g=>g.includes(t));g.splice(g.indexOf(t),1);if(!g.length)nativeGroups.splice(nativeGroups.indexOf(g),1)}};
 return t;
}
const clients=new Map();for(const id of initial){const t=makeTerminal(id,500+ids.indexOf(id));terminals.push(t);clients.set(500+ids.indexOf(id),id.slice(0,8));if(separate)nativeGroups.push([t]);else{if(!nativeGroups.length)nativeGroups.push([]);nativeGroups[0].push(t)}}
const originals=new Map(terminals.map(t=>[t.id,t]));
const vscode={extensions:{getExtension:()=>undefined},EventEmitter:class{event=()=>d;fire(){}},
 TerminalExitReason:{Process:2,User:3},StatusBarAlignment:{Right:1},Uri:{file:fsPath=>({fsPath,scheme:'file'}),parse:s=>({toString:()=>s})},
 workspace:{workspaceFolders:[{uri:{scheme:'file',fsPath:tmp}}],getConfiguration:()=>({get:(key,fallback)=>key==='closeToDrop'?scenario==='attach-failed':key==='autoRecapOnOpen'?scenario==='auto-recap':key==='autoSuspendHours'?0:fallback})},
 commands:{registerCommand:(id,fn)=>{handlers.set(id,fn);return d},executeCommand:async()=>{}},
 window:{terminals,createOutputChannel:()=>({appendLine(){},show(){}}),createStatusBarItem:()=>({show(){}}),createTreeView:()=>({selection:[],onDidChangeSelection:()=>d}),registerFileDecorationProvider:()=>d,onDidOpenTerminal:()=>d,onDidCloseTerminal:fn=>{closeHandler=fn;return d},
 showInformationMessage(){},showWarningMessage:async()=>{warnings++;return 'Open all'},
 createTerminal:opts=>{created++;const id=opts.shellArgs.at(-1).replace(/^tt-/,'');const full=ids.find(x=>x.startsWith(id));assert.ok(full);const t=makeTerminal(full,900+created);t.options=opts;terminals.push(t);const parent=opts.location?.parentTerminal;if(parent){const g=nativeGroups.find(g=>g.includes(parent));assert.ok(g);g.splice(g.indexOf(parent)+1,0,t)}else nativeGroups.push([t]);return t}}};
const originalLoad=Module._load;
const snapshot=()=>ids.map(id=>({id:id.slice(0,8),name:'tt-'+id.slice(0,8),attached:initial.includes(id),working:false,command:'codex',agentCommand:'codex',title:'Task',status:{state:'idle',source:'test'},ramMB:1,activitySec:Date.now()/1000}));
Module._load=function(name,...args){
 if(name==='vscode')return vscode;
 if(name==='./codex-history')return {configureCodexHistory(){},refreshCodexThreads:async()=>{},matchCodexScreen:()=>undefined};
 if(name==='./sessions')return {transcriptCwds:()=>new Map(),transcriptCwd:()=>{coldProbes++;return undefined}};
 if(name==='./tmux')return {tmuxAvailable:()=>true,applyTmuxConf(){},killSession(){kills++},listSessionsAsync:async()=>snapshot(),attachedClientSessionsAsync:async()=>clients,tmuxDiag:()=>'',
  hasTranscript:()=>{coldProbes++;return false},hasCodexSession:()=>{coldProbes++;return true},hasGrokSession:()=>{coldProbes++;return false},hasAgySession:()=>{coldProbes++;return false},
  tmuxLaunch:id=>{coldLaunches++;return{shellPath:'tmux',shellArgs:['cold','tt-'+id.slice(0,8)]}},tmuxAttach:id=>{attaches++;return{shellPath:'tmux',shellArgs:['attach-session','-t','tt-'+id.slice(0,8)]}},
  liveCodexThreadId:()=>{liveProbes++;return undefined},liveAgyTranscript:()=>{liveProbes++;return undefined},liveGrokTranscript:()=>{liveProbes++;return undefined},liveCodexTranscript:()=>{liveProbes++;return undefined}};
 if(name==='./recaps')return {transcriptMtime:()=>100,generateRecap:async()=>{providerCount++;activeProviders++;maxProviders=Math.max(maxProviders,activeProviders);return new Promise(resolve=>providers.push(()=>{activeProviders--;resolve({title:'Updated',recap:'Summary',source:'codex'})}))}};
 return originalLoad.call(this,name,...args);
};
const call=(command,id)=>handlers.get('terminalTabs.'+command)(id?{kind:'tab',id,group:'Test'}:{kind:'group',name:'Test'});
async function flushUntil(predicate){for(let i=0;i<100&&!predicate();i++){const at=timers.findIndex(t=>t.ms===0);if(at>=0)timers.splice(at,1)[0].fn();await Promise.resolve()}assert.ok(predicate(),'fixture must finish its queued work')}
(async()=>{try{
 const ext=require('./out/extension');await ext.activate({subscriptions:[]});timers.length=0;coldProbes=0;
 if(scenario==='attach-failed'){
  await call('openTab',ids[0]);const terminal=terminals[0];terminal.exitStatus={code:1,reason:2};terminals.splice(0,1);closeHandler(terminal);
  for(let i=0;i<25;i++)await Promise.resolve();
  assert.ok(read().has(ids[0]),'a failed attach must not drop its saved chat');assert.equal(kills,0);assert.ok(!timers.some(t=>t.ms===800),'failed attach is not a deliberate user close');
  ext.deactivate();
 }else if(scenario==='auto-recap'){
  for(const id of ids.slice(0,5))await call('openTab',id);
  console.log(JSON.stringify({scenario,liveProbes,providerCount}));
  assert.equal(liveProbes,0,'automatic opening must not run synchronous foreign discovery');
  assert.equal(providerCount,0,'automatic recap must yield until after the open handlers return');
  for(let i=0;i<4;i++){await flushUntil(()=>providers.length===1);assert.equal(activeProviders,1);providers.shift()();await Promise.resolve()}
  await flushUntil(()=>read().meta(ids[3]).recapAt===100);
  for(let i=0;i<30;i++){const at=timers.findIndex(t=>t.ms===0);if(at>=0)timers.splice(at,1)[0].fn();await Promise.resolve()}
  assert.equal(providerCount,4,'unbound foreign chat must not guess a recap source');assert.equal(maxProviders,1,'automatic providers must be globally serialized');
  await call('openTab',ids[5]);await call('openTab',ids[6]);await flushUntil(()=>providers.length===1);
  ext.deactivate();providers.shift()();for(let i=0;i<30;i++){const at=timers.findIndex(t=>t.ms===0);if(at>=0)timers.splice(at,1)[0].fn();await Promise.resolve()}
  assert.equal(providerCount,5,'no queued recap starts after shutdown');assert.equal(read().meta(ids[5]).recapAt,undefined,'ignore provider completion after shutdown');
 }else{
  if(scenario==='group-append')await call('openGroup');else await call('openTab',scenario==='live-reattach'?ids[0]:ids[25]);
  console.log(JSON.stringify({scenario,created,destroyed,coldProbes,coldLaunches,attaches,warnings}));
  assert.equal(coldProbes,0,'a live session must bypass cold transcript discovery');assert.equal(coldLaunches,0,'a live session must use attach-only');assert.equal(liveProbes,0);
  if(scenario==='split-middle'){
   assert.equal(created,25);assert.equal(destroyed,24,'keep the native prefix instead of rebuilding all 49 open panes');
   for(const id of ids.slice(0,25))assert.ok(terminals.includes(originals.get(id)));
   assert.deepEqual(nativeGroups[0].map(t=>t.id),ids);
  }else{
   assert.equal(created,1);assert.equal(destroyed,0,'ordinary opens must retain existing terminal objects');
   if(scenario==='group-append'){assert.equal(warnings,0,'one missing pane is not a 50-chat launch');assert.deepEqual(nativeGroups[0].map(t=>t.id),ids)}
   if(separate)assert.ok(nativeGroups.every(g=>g.length===1));
  }
  const before=created;await call('openTab',scenario==='live-reattach'?ids[0]:ids[25]);assert.equal(created,before,'repeated clicks focus the same terminal');
  ext.deactivate();
 }
 console.log('PTT_OPEN_PATH_COMPLETE');
}finally{fs.rmSync(tmp,{recursive:true,force:true})}})().catch(e=>{console.error(e);process.exitCode=1});
`;

for(const scenario of ['live-reattach','separate-middle','split-middle','group-append','auto-recap','attach-failed']){
 test(`normal open path: ${scenario}`,()=>{
  const result=cp.spawnSync(process.execPath,['-e',fixture],{cwd:path.join(__dirname,'..'),env:{...process.env,PTT_OPEN_CASE:scenario},encoding:'utf8',timeout:15000});
  assert.equal(result.status,0,result.stdout+result.stderr);
  assert.ok(result.stdout.includes('PTT_OPEN_PATH_COMPLETE'),'all async assertions must finish');
 });
}
