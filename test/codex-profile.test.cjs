const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const fixture=String.raw`
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'ptt-profile-'));os.homedir=()=>root;delete process.env.CODEX_HOME;
const p=require('./out/codex-profile');
const id='12345678-1234-1234-1234-123456789abc';const tab='abcdefgh-tab';
function rollout(home,uuid=id,meta=uuid){const dir=path.join(home,'sessions/2026/11/09');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,'rollout-2026-11-09T00-00-00-'+uuid+'.jsonl');fs.writeFileSync(file,JSON.stringify({type:'session_meta',payload:{id:meta,cwd:root}})+'\n');return file}
try{
 const cli=path.join(root,'.codex-cli'),other=path.join(root,'.codex');const file=rollout(cli);
 assert.deepEqual(p.findCodexRollout(id),{id,home:cli,file});
 const {StateStore,rememberCodexLink}=require('./out/state');const state=path.join(root,'slice.json');
 const legacy={groups:[{name:'Project',sessionIds:[tab]}],sessions:{[tab]:{title:'Manually named',project:'',cwd:root,agent:'claude',titleLocked:true}}};
 const stale=new StateStore(state,'test',JSON.parse(JSON.stringify(legacy)));stale.save();
 rememberCodexLink(tab,id,cli);stale.save(); // old extension writes its stale slice on shutdown
 const reloaded=new StateStore(state,'test',JSON.parse(fs.readFileSync(state)));
 assert.equal(reloaded.meta(tab).codexSessionId,id);assert.equal(reloaded.meta(tab).codexHome,cli);assert.equal(reloaded.meta(tab).title,'Manually named');
 rollout(other);assert.equal(p.findCodexRollout(id),undefined,'two profile copies must not be guessed');assert.equal(p.findCodexRollout(id,cli).home,cli);
 fs.unlinkSync(file);assert.equal(p.findCodexRollout(id,cli),undefined,'missing bound profile must not fall back to another account');
 rollout(cli,id,'87654321-1234-1234-1234-123456789abc');assert.equal(p.findCodexRollout(id,cli),undefined,'forged filename is not a match');
 assert.equal(p.findCodexRollout('../'),undefined);assert.equal(p.findCodexRollout('12345678'),undefined);
 const custom=path.join(root,"profile with ' quotes $() ");const customFile=rollout(custom);p.registerCodexHome(custom);
 assert.equal(p.codexRollout(customFile).home,custom);
 const shell=require('node:child_process').execFileSync('/bin/sh',['-c','printf %s '+p.shellQuote(custom)],{encoding:'utf8'});assert.equal(shell,custom);
 console.log('PERSISTENCE_CASES_COMPLETE');
}finally{fs.rmSync(root,{recursive:true,force:true})}
`;
test('separate profile, stale host reload, exact lookup and missing-history preservation',()=>{
 const r=cp.spawnSync(process.execPath,['-e',fixture],{cwd:path.join(__dirname,'..'),encoding:'utf8',timeout:15000});
 assert.equal(r.status,0,r.stdout+r.stderr);assert.match(r.stdout,/PERSISTENCE_CASES_COMPLETE/);
});

test('read-only metadata retains profile and disambiguates identical titles',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'ptt-metadata-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const h=require('../out/codex-history');
 const a={id:'a',name:'Same title',cwd:root,updatedAt:1,codexHome:'/profiles/a'};
 const b={...a,id:'b',codexHome:'/profiles/b'};
 assert.equal(h.matchCodexScreen('',[a,b],'Same title'),undefined);
 assert.equal(h.matchCodexScreen('',[a,b],'Same title','/profiles/b').id,'b');
 const cli=path.join(root,'fake-codex');const trace=path.join(root,'home');
 fs.writeFileSync(cli,'#!'+process.execPath+'\n'+`const fs=require('fs');require('readline').createInterface({input:process.stdin}).on('line',line=>{const q=JSON.parse(line);if(!q.id)return;fs.writeFileSync(${JSON.stringify(trace)},process.env.CODEX_HOME);process.stdout.write(JSON.stringify({id:q.id,result:{}})+'\\n')});`,{mode:0o700});
 const reader=new h.CodexReader(cli,path.join(root,'selected-home'));
 try{await reader.initialize();assert.equal(fs.readFileSync(trace,'utf8'),path.join(root,'selected-home'))}finally{reader.close()}
});

test('foreground observation finds custom profile without reading credentials and rejects ambiguity',async t=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'ptt-observation-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 const original=cp.execFile;let calls=0;
 cp.execFile=(_file,args,options,callback)=>{
  calls++;assert.deepEqual(args.slice(0,3),['-a','-p','123,456']);assert.equal(options.timeout,2000);
  callback(null,'p123\nn'+root+'/private-profile/state_5.sqlite\np456\nn'+root+'/one/state_5.sqlite\nn'+root+'/two/state_5.sqlite\n');
 };
 try{const result=await require('../out/codex-profile').probeCodexBindings([123,123,456]);assert.equal(calls,1);assert.deepEqual(result.get(123),{home:root+'/private-profile'});assert.equal(result.has(456),false)}finally{cp.execFile=original}
});
