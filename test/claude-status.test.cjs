const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { claudeStatus, validateClaudeStatus } = require('../out/claude-status');
const owner = { pid:'47735', startTime:'Sat Oct 31 04:01:24 2026' };
const record = { pid:47735, procStart:owner.startTime, sessionId:'5f41bd1d-c792-402b-9727-33596807b69e',
  tmux:'tt-5f41bd1d:@33.%33', kind:'interactive', status:'busy' };
const check = (r=record, p=owner) => validateClaudeStatus(r, p, 'tt-5f41bd1d');

test('native lifecycle follows idle, work, input wait, resume, completion without a timer', () => {
  for (const status of ['idle','busy','waiting','busy','idle']) assert.equal(check({...record,status}),status);
  assert.equal(check({...record,updatedAt:1,statusUpdatedAt:1}),'busy','long work has no arbitrary expiry');
});

test('stale/reused PID, other pane, background worker, and unsupported schema cannot claim blue', () => {
  for (const value of [null, [], {}, {...record,pid:1}, {...record,pid:'47735'},
    {...record,procStart:'Fri Oct 30 04:01:24 2026'}, {...record,procStart:undefined},
    {...record,tmux:'tt-another:@33.%33'}, {...record,kind:'bg'}, {...record,sessionId:''},
    {...record,status:'new-state'}, {...record,status:undefined}]) assert.equal(check(value),undefined);
  assert.equal(check(record,{...owner,startTime:undefined}),undefined);
});

test('registry reader handles deletion, partial writes, oversized files and recovery without cached busy', t => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(),'ptt-native-status-'));
  t.after(() => fs.rmSync(dir,{recursive:true,force:true}));
  fs.mkdirSync(path.join(dir,'sessions'));
  const file = path.join(dir,'sessions','47735.json');
  const read = () => claudeStatus(owner,'tt-5f41bd1d',dir);
  assert.equal(read(),undefined);
  fs.writeFileSync(file,JSON.stringify(record)); assert.equal(read(),'busy');
  fs.writeFileSync(file,'{"status":'); assert.equal(read(),undefined);
  fs.writeFileSync(file,' '.repeat(65537)); assert.equal(read(),undefined);
  fs.writeFileSync(file,JSON.stringify({...record,status:'idle'})); assert.equal(read(),'idle');
  fs.unlinkSync(file); assert.equal(read(),undefined);
});
