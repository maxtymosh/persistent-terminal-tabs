const { test } = require('node:test');
const assert = require('node:assert/strict');
const cp = require('node:child_process');
const { listSessions, tmuxAvailable } = require('../out/tmux');
const { isAgentWorking } = require('../out/working-status');

test('terminal adoption accepts only exact live PTT client identities and fails closed', { skip: !tmuxAvailable() }, () => {
  const { attachedClientSessions } = require('../out/tmux');
  const original = cp.execFileSync;
  try {
    cp.execFileSync = (file,args) => {
      assert.ok(args.includes('list-clients'));
      return '500|tt-5f41bd1d\n501|other-session\ninvalid|tt-5f41bd1d\n502|tt-b2e4e98a\n';
    };
    assert.deepEqual([...attachedClientSessions()],[[500,'5f41bd1d'],[502,'b2e4e98a']]);
    cp.execFileSync = () => { throw Error('unavailable'); };
    assert.equal(attachedClientSessions().size,0);
  } finally { cp.execFileSync = original; }
});

test('tmux snapshot integrates foreground ownership without changing attachment, title or RAM', { skip: !tmuxAvailable() }, () => {
  const original = cp.execFileSync;
  let gone = false, psFailed = false, title = '⠋ Work | host', attached = 1;
  cp.execFileSync = (file, args, options) => {
    if (file === 'ps') {
      if (psFailed) throw new Error('process probe unavailable');
      assert.ok(args.includes('pid=,ppid=,pgid=,tpgid=,tty=,stat=,rss=,lstart=,comm='));
      assert.equal(options.env.TZ, 'UTC', 'Claude process birth tokens use UTC, not local time');
      assert.equal(options.env.LC_ALL, 'C');
      return '4262 4257 4262 4262 ttys010 Ss+ 1024 /bin/zsh\n' +
        (gone ? '' : '4302 4262 4262 4262 ttys010 R+ 2048 codex\n');
    }
    if (args.includes('list-sessions')) {
      assert.match(args[args.indexOf('-F') + 1], /pane_tty/);
      return `tt-fd1b72de|${attached}|4262|zsh|123|/dev/ttys010|${title}\n`;
    }
    return original(file, args);
  };
  try {
    const sample = () => {
      const [s] = listSessions();
      assert.equal(s.id, 'fd1b72de');
      assert.equal(s.command, 'zsh');
      assert.equal(s.title, title);
      assert.equal(s.attached, Boolean(attached));
      return { s, busy: s.working };
    };
    assert.equal(sample().busy, true);
    assert.equal(sample().s.ramMB, 3);
    attached = 0;
    assert.equal(sample().busy, true, 'detached Codex can still work');
    title = 'Work | host';
    assert.equal(sample().busy, false, 'completion restores attachment color');
    title = '[ ! ] Action Required | Work | host';
    assert.equal(sample().busy, false);
    title = '⠋ Work | host';
    gone = true;
    assert.equal(sample().busy, false, 'stale title after exit');
    gone = false; psFailed = true;
    assert.equal(sample().busy, false, 'no cached or title-only fallback after probe failure');
  } finally { cp.execFileSync = original; }
});

test('Claude native state reaches the same tmux working flag and preserves attachment colors', { skip: !tmuxAvailable() }, t => {
  const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ptt-claude-status-'));
  const original = cp.execFileSync, config = process.env.CLAUDE_CONFIG_DIR;
  process.env.CLAUDE_CONFIG_DIR = dir;
  fs.mkdirSync(path.join(dir, 'sessions'));
  t.after(() => {
    cp.execFileSync = original;
    if (config === undefined) delete process.env.CLAUDE_CONFIG_DIR; else process.env.CLAUDE_CONFIG_DIR = config;
    fs.rmSync(dir, { recursive: true, force: true });
  });
  let attached = 1, gone = false, failed = false;
  const start = 'Sat Oct 31 04:01:24 2026';
  const file = path.join(dir, 'sessions', '47735.json');
  const state = status => fs.writeFileSync(file, JSON.stringify({ pid:47735, kind:'interactive',
    sessionId:'actual-claude-session', procStart:start, tmux:'tt-5f41bd1d:@33.%33', status }));
  cp.execFileSync = (file, args) => {
    if (file === 'ps') {
      if (failed) throw Error('unavailable');
      return `47202 1 47202 47735 ttys033 S 1024 ${start} /bin/zsh\n` +
        (gone ? '' : `47735 47202 47735 47735 ttys033 S+ 2048 ${start} /Users/test/claude/versions/2.1.314\n`);
    }
    if (args.includes('list-sessions')) return `tt-5f41bd1d|${attached}|47202|2.1.314|123|/dev/ttys033|✳ Unchanging title\n`;
    return original(file, args);
  };
  for (const status of ['idle', 'busy', 'waiting', 'busy', 'idle']) {
    state(status);
    const [s] = listSessions();
    assert.equal(s.agentCommand, 'claude');
    assert.equal(s.claudeStatus, status);
    assert.equal(s.working, status === 'busy');
    assert.equal(s.attached, true);
  }
  state('busy'); attached = 0;
  assert.equal(listSessions()[0].working, true, 'delegated work continues while detached');
  assert.equal(listSessions()[0].attached, false);
  gone = true;
  assert.equal(listSessions()[0].working, false, 'crashed/exited owner cannot retain blue');
  gone = false; failed = true;
  assert.equal(listSessions()[0].working, false, 'unavailable process evidence clears blue');
  failed = false; fs.unlinkSync(file);
  assert.equal(listSessions()[0].working, false, 'missing runtime record clears blue');
});
