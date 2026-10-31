const { test } = require('node:test');
const assert = require('node:assert/strict');
const cp = require('node:child_process');
const { listSessions, tmuxAvailable } = require('../out/tmux');
const { isAgentWorking } = require('../out/working-status');

test('tmux snapshot integrates foreground ownership without changing attachment, title or RAM', { skip: !tmuxAvailable() }, () => {
  const original = cp.execFileSync;
  let gone = false, psFailed = false, title = '⠋ Work | host', attached = 1;
  cp.execFileSync = (file, args) => {
    if (file === 'ps') {
      if (psFailed) throw new Error('process probe unavailable');
      assert.ok(args.includes('pid=,ppid=,pgid=,tpgid=,tty=,stat=,rss=,comm='));
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
      return { s, busy: isAgentWorking(s.agentCommand ?? '', s.title) };
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
