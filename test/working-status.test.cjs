const { test } = require('node:test');
const assert = require('node:assert/strict');
const { isAgentWorking } = require('../out/working-status');

test('Codex busy title follows start, work, approval, completion, and process exit without a hold', () => {
  for (const frame of '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏') {
    assert.equal(isAgentWorking('codex', `${frame} Repair PTT | host`), true);
  }
  assert.equal(isAgentWorking('codex', '[ ! ] Action Required | Repair PTT | host'), false);
  assert.equal(isAgentWorking('codex', 'Repair PTT | host'), false);
  assert.equal(isAgentWorking('zsh', '⠋ Repair PTT | host'), false, 'stale OSC title after exit');
  assert.equal(isAgentWorking('codex', ''), false, 'missing signal cannot retain blue');
});

test('idle screen animation, old interrupt phrases, and unrelated agents never establish work', () => {
  // These actual idle titles remain unchanged while the prompt particle animation redraws.
  for (const title of ['Prepare Ads and SEO proposals | maxtymosh', 'Recover gopetzen.com | maxtymosh', 'esc to interrupt | host']) {
    assert.equal(isAgentWorking('codex', title), false);
  }
  for (const command of ['zsh', 'claude', '2.1.284', 'grok', 'agy']) {
    assert.equal(isAgentWorking(command, '⠋ Repair PTT | host'), false);
  }
  assert.equal(isAgentWorking('codex', 'Repair ⠋ PTT | host'), false);
  assert.equal(isAgentWorking('codex', '⠁ particle | host'), false);
});

const { parseProcessSnapshot, foregroundAgent } = require('../out/working-status');
const wrapper = '4262 4257 4262 4262 ttys010 Ss+ 32 /bin/zsh';
const codex = '4302 4262 4262 4262 ttys010 R+ 35584 /opt/Codex App/bin/codex';
const owner = (lines, pid='4262', tty='/dev/ttys010') =>
  foregroundAgent(pid, tty, parseProcessSnapshot(lines.join('\n')));
const busy = (lines, title='⠋ Live task | host') => isAgentWorking(owner(lines) ?? '', title);

test('real macOS wrapper regression: zsh and Codex share the foreground group', () => {
  const snapshot = [wrapper, codex];
  assert.equal(owner(snapshot), 'codex');
  for (const frame of '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏') assert.equal(busy(snapshot, `${frame} Live task | host`), true);
  assert.equal(busy(snapshot, 'Live task | host'), false, 'completion clears immediately');
  assert.equal(busy(snapshot, '[ ! ] Action Required | Live task | host'), false, 'approval is not working');
  assert.equal(busy([wrapper]), false, 'exited Codex cannot leave blue behind');
  assert.equal(busy(snapshot, ''), false, 'missing title cannot retain blue');
  assert.equal(busy([]), false, 'failed process probe cannot retain blue');
});

test('job-controlled Codex and nested shell launchers resolve on macOS and Linux', () => {
  assert.equal(owner(['10 1 10 20 pts/4 Ss 32 /bin/bash',
    '20 10 20 20 pts/4 S+ 42 codex'], '10', '/dev/pts/4'), 'codex');
  assert.equal(owner([wrapper, '4290 4262 4262 4262 ttys010 S+ 32 /bin/sh',
    codex.replace('4302 4262', '4302 4290')]), 'codex');
  assert.equal(owner(['10 1 10 10 pts/4 S+ 42 codex'], '10', '/dev/pts/4'), 'codex');
});

test('retained spinner cannot borrow identity from an unrelated, background or stopped process', () => {
  for (const other of [
    codex.replace('4302 4262', '4302 9999'), // unrelated parent
    codex.replace('4302 4262 4262', '4302 4262 4302'), // background group
    codex.replace('ttys010', '??'), // headless backend
    codex.replace('ttys010', 'ttys011'), // another TTY
    codex.replace('R+', 'T'), codex.replace('R+', 'Z'), codex.replace('R+', 't'),
    codex.replace('/opt/Codex App/bin/codex', '/opt/bin/codex-app-server'),
  ]) assert.equal(busy([wrapper, other]), false, other);
  assert.equal(owner([wrapper, codex], '4262', '/dev/ttys011'), undefined);
  assert.equal(owner([wrapper.replace('4262 4262 ttys010', '4262 -1 ttys010'), codex]), undefined);
});

test('an agent tool process does not replace its owning Claude/Grok/Antigravity UI', () => {
  for (const command of ['claude', '2.1.314', 'grok', 'agy', 'codex']) {
    assert.equal(busy([wrapper,
      `4290 4262 4290 4262 ttys010 S 32 ${command}`,
      codex.replace('4302 4262', '4302 4290')]), false, command);
  }
});

test('snapshot parsing preserves executable paths with spaces, ignores malformed rows and terminates cycles', () => {
  const parsed = parseProcessSnapshot(`${wrapper}\n${codex}\ninvalid\n`);
  assert.equal(parsed.size, 2);
  assert.equal(parsed.get('4302').rssKB, 35584);
  assert.equal(parsed.get('4302').command, '/opt/Codex App/bin/codex');
  assert.equal(owner(['4262 4263 4262 4262 ttys010 S+ 1 zsh',
    '4263 4262 4262 4262 ttys010 S+ 1 sh']), undefined);
});

test('Claude launchers resolve their native binary and retain process birth identity', () => {
  const { foregroundAgentDetails } = require('../out/working-status');
  const start = 'Sat Oct 31 04:01:24 2026';
  const snapshot = parseProcessSnapshot(`${wrapper}\n47735 4262 4262 4262 ttys010 S+ 42 ${start} /Users/Test Person/claude/versions/2.1.314`);
  const agent = foregroundAgentDetails('4262', '/dev/ttys010', snapshot);
  assert.equal(agent.name, 'claude');
  assert.equal(agent.process.pid, '47735');
  assert.equal(agent.process.startTime, start);
  assert.equal(agent.process.command, '/Users/Test Person/claude/versions/2.1.314');
  const day = parseProcessSnapshot('1 0 1 1 pts/4 S 12 Mon Nov  2 01:02:03 2026 claude').get('1');
  assert.equal(day.startTime, 'Mon Nov 2 01:02:03 2026');
});


test('registered local clients resolve through wrappers, but background and nested apps cannot own the pane', () => {
  const {parseProcessSnapshot,foregroundAgentDetails}=require('../out/working-status');
  const ps=parseProcessSnapshot('10 1 10 20 ttys1 S 10 /bin/zsh\n20 10 20 20 ttys1 S+ 10 /usr/bin/python3\n30 20 20 20 ttys1 S+ 10 /usr/bin/node');
  const registered=p=>p.pid==='20'?'my-local-client':p.pid==='30'?'gemini':undefined;
  assert.equal(foregroundAgentDetails('10','/dev/ttys1',ps,undefined,registered).name,'my-local-client');
  ps.get('20').pgid='99';assert.equal(foregroundAgentDetails('10','/dev/ttys1',ps,undefined,registered),undefined);
});
