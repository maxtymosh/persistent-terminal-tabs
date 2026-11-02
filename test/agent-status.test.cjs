const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {resolveAgentStatus}=require('../out/agent-status');
const {readStatusRecord,writeStatusRecord}=require('../out/status-record');
const {hookState}=require('../out/status-reporter');
const {geminiSettings,grokHooks}=require('../out/status-setup');
const owner={pid:'123',ppid:'1',pgid:'123',tpgid:'123',tty:'ttys1',state:'S+',rssKB:1,command:'node',startTime:'Sun Nov 1 20:00:00 2026'};

test('one engine resolves native states and never promotes missing evidence to idle',()=>{
 const get=(agent,title='',claude)=>resolveAgentStatus({agent,title,claude,owner}).state;
 assert.equal(get('claude','','busy'),'working'); assert.equal(get('claude','','waiting'),'waiting');
 assert.equal(get('claude','','idle'),'idle');assert.equal(get('claude'),'unknown');
 assert.equal(get('codex','⠋ active'),'working');assert.equal(get('codex','[ ! ] Action Required | task'),'waiting');
 assert.equal(get('codex','unchanged title'),'unknown');
 for(const [title,state] of [['✦  Working… (project)','working'],['⏲  Working… (project)','working'],['✋  Action Required (project)','waiting'],['◇  Ready (project)','idle'],['Gemini CLI (project)','unknown']]) assert.equal(get('gemini',title),state);
 assert.equal(resolveAgentStatus({agent:'grok',title:'',owner,reported:{state:'working',source:'grok-bridge'}}).state,'unknown','known unreliable Grok cancellation must not latch blue');
 assert.equal(get('unrelated','✦  Working… (project)'),'unknown');
 assert.equal(resolveAgentStatus({title:'⠋ task',agent:'codex'}).state,'unknown');
 assert.equal(resolveAgentStatus({title:'',owner:{...owner,state:'T'},reported:{state:'working',source:'bridge'}}).state,'unknown');
 assert.equal(resolveAgentStatus({title:'',owner,reported:{state:'working',source:'local-client'}}).state,'working');
});
test('generic records reject PID reuse, wrong pane, partial and unsupported records; quiet work has no expiry',t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ptt-status-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const r={schema:1,pid:owner.pid,startTime:owner.startTime,tmux:'tt-test',application:'local-client',session:'session-1',state:'working',updated:1};
 writeStatusRecord(r,dir);assert.equal(readStatusRecord(owner,'tt-test',dir).state,'working');
 assert.equal(readStatusRecord({...owner,startTime:'different'},'tt-test',dir),undefined);
 assert.equal(readStatusRecord(owner,'tt-other',dir),undefined);
 fs.writeFileSync(path.join(dir,'123.json'),'{');assert.equal(readStatusRecord(owner,'tt-test',dir),undefined);
 writeStatusRecord({...r,state:'idle'},dir);assert.equal(readStatusRecord(owner,'tt-test',dir).state,'idle');
 writeStatusRecord({...r,schema:2},dir);assert.equal(readStatusRecord(owner,'tt-test',dir),undefined);
});
test('Grok lifecycle handles cancellation, errors, waiting, resume and excludes child session events',()=>{
 const get=(event,other={})=>hookState('grok',{hook_event_name:event,...other});
 assert.equal(get('UserPromptSubmit'),'unknown');
 for(const event of ['PreToolUse','PostToolUse','PreCompact'])assert.equal(get(event),'working');
 for(const event of ['SessionStart','Stop','StopFailure','StopCancelled','SessionEnd'])assert.equal(get(event),'idle');
 assert.equal(get('Notification',{notificationType:'permission_prompt'}),'waiting');
 assert.equal(get('Notification',{notificationType:'idle_prompt'}),'idle');
 assert.equal(get('Notification',{message:'working'}),undefined);
 assert.equal(get('Stop',{subagentType:'explore'}),undefined);
 assert.equal(hookState('gemini',{hook_event_name:'SessionStart'}),'unknown');
 assert.equal(hookState('gemini',{hook_event_name:'AfterAgent'}),undefined,'Gemini native title owns lifecycle including cancellation');
});
test('hook setup preserves unrelated settings and is idempotent without granting permissions',()=>{
 const initial={security:{auth:{selectedType:'test'}},hooks:{SessionStart:[{hooks:[{name:'other',command:'keep-me'}]}],BeforeAgent:[{hooks:[]}]}};
 const first=geminiSettings(initial,'/bridge');assert.deepEqual(geminiSettings(first,'/bridge'),first);
 assert.deepEqual(first.security,initial.security);assert.equal(first.hooks.SessionStart[0].hooks[0].command,'keep-me');
 assert.deepEqual(first.hooks.BeforeAgent,initial.hooks.BeforeAgent);
 const grok=grokHooks('/bridge');assert.ok(grok.hooks.StopCancelled);assert.ok(!grok.hooks.SubagentStop);
});


test('Grok native microsecond process birth rejects a registry PID reused by another Grok',()=>{
 const {grokBirthMatches}=require('../out/status-reporter');
 const stamp=Date.parse(owner.startTime+' UTC')*1000+123456;
 assert.equal(grokBirthMatches(stamp,owner),true);
 assert.equal(grokBirthMatches(stamp-1000000,owner),false);
 assert.equal(grokBirthMatches(undefined,owner),false);
});

// Native default titles captured from the reported Upwork sessions.
test('Codex clears busy to native idle and recognizes both approval blink phases',()=>{
 const get=title=>resolveAgentStatus({agent:'codex',title,owner}).state;
 for(const name of ['Connect to Zhenia account','Continue Upwork handoff','Send all written proposals']) {
  const title=name+' | maxtymosh';
  assert.equal(get('⠋ '+title),'working');
  assert.equal(get('[ ! ] Action Required | '+title),'waiting');
  assert.equal(get('[ . ] Action Required | '+title),'waiting');
  assert.equal(get(title),'idle');
  assert.equal(get('⠹ '+title),'working');
  assert.equal(get(title),'idle');
 }
 assert.equal(get('● ⠹ task | project'),'working');
 for(const label of ['Working','Thinking','Waiting']) assert.equal(get(label+' | task | project'),'working');
 assert.equal(get('Ready | task | project'),'idle');
 for(const title of ['', 'shell title', 'Starting | project', '● task | project'])assert.equal(get(title),'unknown');
 assert.equal(resolveAgentStatus({agent:'codex',title:'task | project'}).state,'unknown');
});
