#!/usr/bin/env python3
# Isolated real tmux lifecycle; never uses the user socket, model or credentials.
import tempfile,pathlib,subprocess,json,os,time,shlex,shutil
repo=pathlib.Path(__file__).resolve().parents[1];tmp=pathlib.Path(tempfile.mkdtemp(prefix='ptt-bridge-',dir='/tmp'));node=shutil.which('node');tmux=shutil.which('tmux');assert node and tmux,'node and tmux are required'
env={**os.environ,'HOME':str(tmp),'TMUX_TMPDIR':str(tmp),'PATH':f'{pathlib.Path(node).parent}:/opt/homebrew/bin:/usr/bin:/bin'}
script=tmp/'client.cjs';script.write_text('''const cp=require('child_process'),fs=require('fs');
const reporter=process.argv[2],target=process.argv[3];
(async()=>{for(const state of ['working','waiting','idle','working','unknown']) {
 cp.execFileSync(process.execPath,[reporter,'report','local-model-client',state,'--pid',String(process.pid),'--session','independent-local-session']);
 fs.writeFileSync(target,state);await new Promise(r=>setTimeout(r,500));
}process.exit(0)})().catch(e=>{fs.writeFileSync(target,'ERROR:'+e.message);process.exit(1)});
''')
command=' '.join(map(shlex.quote,[node,str(script),str(repo/'out/status-reporter.js'),str(tmp/'phase')]))+'; sleep 10'
subprocess.run([tmux,'-L','terminal-tabs','new-session','-d','-s','tt-bridge01',command],env=env,check=True)
seen=[]
try:
 for _ in range(40):
  time.sleep(.15)
  js=f"const s=require({json.dumps(str(repo/'out/tmux.js'))}).listSessions();console.log(JSON.stringify(s.map(x=>({{status:x.status,working:x.working,agent:x.agentCommand}}))));"
  r=subprocess.run([node,'-e',js],env=env,capture_output=True,text=True,check=True)
  phase=(tmp/'phase').read_text() if (tmp/'phase').exists() else 'starting'
  data=json.loads(r.stdout)
  if data and (not seen or seen[-1]['phase']!=phase):seen.append({'phase':phase,'detected':data[0]})
  if phase=='unknown' and len(seen)>=5:break
 print(json.dumps(seen,indent=2));assert all(any(x['detected']['status']['state']==state for x in seen) for state in ['working','waiting','idle','unknown']),seen
 time.sleep(1)
 r=subprocess.run([node,'-e',js],env=env,capture_output=True,text=True,check=True);print('After owner exit:',r.stdout.strip());assert not json.loads(r.stdout)[0]['working']
 (tmp/'evidence.json').write_text(json.dumps(seen,indent=2));print('Evidence:',tmp/'evidence.json')
finally:subprocess.run([tmux,'-L','terminal-tabs','kill-session','-t','tt-bridge01'],env=env,capture_output=True)
