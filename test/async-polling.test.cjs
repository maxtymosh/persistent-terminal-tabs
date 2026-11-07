const {test}=require('node:test');
const assert=require('node:assert/strict');
const cp=require('node:child_process');
const {listSessions,listSessionsAsync,tmuxAvailable}=require('../out/tmux');

test('async snapshot yields while slow child probes run and preserves native work/attachment semantics', {skip:!tmuxAvailable()},async t=>{
  const originalAsync=cp.execFile,originalSync=cp.execFileSync;
  t.after(()=>{cp.execFile=originalAsync;cp.execFileSync=originalSync;});
  let gone=false,psFailed=false,attached=1,title='⠋ Work | host';
  const output=(file,args)=>{
    if(file==='ps'){
      if(psFailed)throw Error('ps unavailable');
      return '4262 4257 4262 4262 ttys010 Ss+ 1024 /bin/zsh\n'+
        (gone?'':'4302 4262 4262 4262 ttys010 R+ 2048 codex\n');
    }
    assert.ok(args.includes('list-sessions'));
    return `tt-fd1b72de|${attached}|4262|zsh|123|/dev/ttys010|${title}\n`;
  };
  let probes=0;
  cp.execFile=(file,args,opts,done)=>{
    probes++;assert.equal(opts.timeout,2000);assert.equal(opts.maxBuffer,8*1024*1024);
    if(file==='ps'){assert.equal(opts.env.LC_ALL,'C');assert.equal(opts.env.TZ,'UTC');}
    setTimeout(()=>{try{done(null,output(file,args));}catch(e){done(e,'');}},40);
  };
  cp.execFileSync=(file,args)=>output(file,args);
  let responsive=false;
  const reading=listSessionsAsync();setTimeout(()=>{responsive=true;},5);
  const first=await reading;
  assert.ok(responsive,'event loop must continue during tmux and ps reads');
  assert.equal(probes,2,'exactly one tmux and one process snapshot');
  assert.deepEqual(first,listSessions(),'same shared status/identity/RAM interpretation');
  assert.equal(first[0].working,true);assert.equal(first[0].ramMB,3);
  attached=0;title='Work | host';
  const idle=await listSessionsAsync();assert.equal(idle[0].attached,false);assert.equal(idle[0].status.state,'idle');
  title='[ ! ] Action Required | Work | host';
  assert.equal((await listSessionsAsync())[0].status.state,'waiting');
  title='⠋ Work | host';gone=true;
  assert.equal((await listSessionsAsync())[0].working,false,'exit rejects retained busy title');
  gone=false;psFailed=true;
  const failed=await listSessionsAsync();assert.equal(failed[0].working,false);assert.equal(failed[0].status.state,'unknown');
});

test('async socket fallback is bounded and no-server result skips ps', {skip:!tmuxAvailable()},async t=>{
  const original=cp.execFile;t.after(()=>{cp.execFile=original;});let count=0;
  cp.execFile=(file,args,opts,done)=>{
    count++;assert.notEqual(file,'ps');assert.equal(opts.timeout,2000);
    queueMicrotask(()=>done(Error('server unavailable'),''));
  };
  assert.deepEqual(await listSessionsAsync(),[]);assert.equal(count,2);
});

test('50 live chats and 100-chat stress fixture still use only two async child probes per snapshot', {skip:!tmuxAvailable()},async t=>{
  const original=cp.execFile;t.after(()=>{cp.execFile=original;});
  for(const count of [50,100]){
    let probes=0,yielded=false;
    cp.execFile=(file,args,options,done)=>{
      probes++;
      const rows=Array.from({length:count},(_,i)=>file==='ps'
        ?`${50000+i} 1 ${50000+i} ${50000+i} ttys${i} S+ 1024 codex`
        :`tt-${String(i).padStart(8,'0')}|1|${50000+i}|codex|123|/dev/ttys${i}|${i%2?'Task':'⠋ Task'} | host`);
      setTimeout(()=>done(null,rows.join('\n')),10);
    };
    const poll=listSessionsAsync();setTimeout(()=>{yielded=true;},1);
    const result=await poll;
    assert.ok(yielded);assert.equal(probes,2,`${count} chats must not multiply system snapshots`);
    assert.equal(result.length,count);assert.equal(result.filter(s=>s.working).length,count/2);
    assert.ok(result.every(s=>s.attached&&s.ramMB===1));
  }
});

test('background ticks and clicks share one async read, avoid sync binding probes, reject stale results and stop on shutdown',()=>{
  const result=cp.spawnSync(process.execPath,['-e',String.raw`
    const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),Module=require('node:module');
    const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ptt-polling-'));os.homedir=()=>tmp;
    const timeouts=[],intervals=[];global.setTimeout=fn=>{timeouts.push(fn);return 0};global.setInterval=(fn,ms)=>{intervals.push({fn,ms});return 0};
    const {StateStore,workspaceStatePath}=require('./out/state');
    const liveIds=['live0001-session',...Array.from({length:49},(_,i)=>'live'+String(i+2).padStart(4,'0')+'-session')];
    const ids=[...liveIds,...Array.from({length:73},(_,i)=>'cold'+String(i).padStart(4,'0')+'-session')];
    new StateStore(workspaceStatePath(tmp),tmp,{groups:[{name:'Test',sessionIds:ids}],sessions:Object.fromEntries(ids.map(id=>[id,{title:'Task',cwd:tmp,codexSessionId:'thread-1'}]))}).save();
    const handlers=new Map(),d={dispose(){}};let provider,working=true,reads=0,syncReads=0,resolveRead,holdHistory=false,resolveHistory;
    const terminals=liveIds.map((id,i)=>({name:'Codex',processId:Promise.resolve(500+i),show(){},dispose(){throw Error('must retain user terminal')}}));
    const snapshot=()=>liveIds.map(id=>({id:id.slice(0,8),name:'tt-'+id.slice(0,8),attached:true,working,command:'zsh',title:'Work | host',agentCommand:'codex',status:{state:working?'working':'idle',source:'test'},ramMB:1,activitySec:1}));
    const vscode={extensions:{getExtension:()=>undefined},EventEmitter:class{event=()=>d;fire(){}},TreeItem:class{constructor(label){this.label=label}},ThemeIcon:class{constructor(id,color){this.id=id;this.color=color}},ThemeColor:class{constructor(id){this.id=id}},MarkdownString:class{appendMarkdown(){}},TreeItemCollapsibleState:{None:0},StatusBarAlignment:{Right:1},Uri:{file:fsPath=>({fsPath,scheme:'file'}),parse:s=>({toString:()=>s})},
      workspace:{workspaceFolders:[{uri:{scheme:'file',fsPath:tmp}}],getConfiguration:()=>({get:(key,fallback)=>key==='autoSuspendHours'?0:fallback})},commands:{registerCommand:(id,fn)=>{handlers.set(id,fn);return d},executeCommand:async()=>{}},
      window:{terminals,createOutputChannel:()=>({appendLine(){},show(){}}),createStatusBarItem:()=>({show(){}}),createTreeView:(id,opts)=>{provider=opts.treeDataProvider;return{selection:[],onDidChangeSelection:()=>d}},registerFileDecorationProvider:()=>d,onDidOpenTerminal:()=>d,onDidCloseTerminal:()=>d,showInformationMessage(){},createTerminal(){throw Error('must not launch')}}};
    const real=Module._load;
    Module._load=function(name,...args){
      if(name==='vscode')return vscode;
      if(name==='./codex-history')return{configureCodexHistory(){},refreshCodexThreads:()=>holdHistory?new Promise(r=>{resolveHistory=r}):Promise.resolve(),matchCodexScreen:()=>undefined};
      if(name==='./tmux')return{tmuxAvailable:()=>true,applyTmuxConf(){},listSessions:()=>{syncReads++;return snapshot()},listSessionsAsync:()=>{reads++;return new Promise(r=>{resolveRead=r})},attachedClientSessions:()=>new Map(liveIds.map((id,i)=>[500+i,id.slice(0,8)])),tmuxDiag:()=>'',hasTranscript:()=>false,liveCodexThreadId:()=>undefined};
      if(name==='./sessions')return{transcriptCwds:()=>new Map()};
      return real.call(this,name,...args);
    };
    (async()=>{try{
      const ext=require('./out/extension');await ext.activate({subscriptions:[]});
      // Startup catch-ups are tested independently; isolate the normal 8s cadence and click here.
      timeouts.length=0;syncReads=0;
      const tick=intervals.find(i=>i.ms===8000).fn;
      const color=()=>provider.getTreeItem({kind:'tab',id:ids[0],group:'Test'}).iconPath.color?.id;
      assert.equal(color(),'charts.blue');
      const one=tick(),two=tick();
      handlers.get('terminalTabs.openTab')({kind:'tab',id:ids[0],group:'Test'});
      const click=timeouts.shift()();
      assert.equal(reads,1,'concurrent clicks/ticks share a single snapshot');
      working=false;resolveRead(snapshot());await Promise.all([one,two,click]);
      assert.equal(color(),'charts.green');assert.equal(syncReads,0,'normal polling/binding must not call listSessions again');
      // A direct diagnostic after a slower background read supersedes that old result.
      const old=tick();const stale=snapshot();working=true;
      handlers.get('terminalTabs.diagDots')();assert.equal(color(),'charts.blue');
      resolveRead(stale);await old;assert.equal(color(),'charts.blue','discard pre-action snapshot');
      // Metadata can be slow independently; live status must still poll on the next tick.
      holdHistory=true;const historyTick=tick();resolveRead(snapshot());
      for(let n=0;n<10&&!resolveHistory;n++)await Promise.resolve();
      assert.ok(resolveHistory,'metadata request is pending');
      const beforeRead=reads;const nextTick=tick();assert.equal(reads,beforeRead+1);
      working=false;resolveRead(snapshot());await nextTick;
      assert.equal(color(),'charts.green','slow metadata cannot freeze the status timer');
      holdHistory=false;resolveHistory();await historyTick;
      working=true;handlers.get('terminalTabs.diagDots')();
      const last=tick();working=false;ext.deactivate();resolveRead(snapshot());await last;
      assert.equal(color(),'charts.blue','ignore result after deactivation');
      const before=reads;await tick();assert.equal(reads,before,'shutdown never starts another read');
    }finally{fs.rmSync(tmp,{recursive:true,force:true})}})().catch(e=>{console.error(e);process.exitCode=1});
  `],{cwd:require('node:path').join(__dirname,'..'),encoding:'utf8',timeout:10000});
  assert.equal(result.status,0,result.stderr||result.stdout);
});
