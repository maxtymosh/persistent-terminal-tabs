const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const cp = require('node:child_process');
const { snapshot, validate, check, evidence, merge, hash, CHECKS } = require('../scripts/quality-gate.cjs');
const { verify } = require('../scripts/check-package.cjs');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ptt-gate-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const git = (...args) => cp.execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git('init', '-q'); fs.writeFileSync(path.join(root, 'source.txt'), 'reviewed source');
  git('add', 'source.txt'); git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-qm', 'fixture');
  fs.mkdirSync(path.join(root, 'docs/development/gates'), { recursive: true });
  fs.writeFileSync(path.join(root, 'proof.md'), 'Observed test and review evidence');
  const proof = { path: 'proof.md', sha256: hash(fs.readFileSync(path.join(root, 'proof.md'))) };
  const record = { schema: 1, task: 'fixture', scope: 'isolated gate contract', reviewer: 'local reviewer', verdict: 'Ship', baseRevision: git('rev-parse', 'HEAD'), sourceSha256: snapshot(root), checks: Object.fromEntries(CHECKS.map(k => [k, { status: 'pass', evidence: proof }])) };
  return { root, record, proof, git };
}

test('admission rejects missing, stale, failed, and tampered evidence; release needs actual native QA', t => {
  const { root, record, proof } = fixture(t);
  assert.throws(() => check(root), /no evidence record/);
  assert.throws(() => merge(root, 0), /Positive PR number/);
  assert.throws(() => merge(root, 1), /Commit exact reviewed inputs/);
  assert.equal(validate(root, record, 'merge').status, 'pass');
  const blocked = structuredClone(record); blocked.checks.behavior.status = 'blocked';
  assert.throws(() => validate(root, blocked, 'merge'), /behavior/);
  assert.throws(() => validate(root, record, 'release'), /Separate release verdict/);
  record.releaseVerdict = 'Ship'; record.releaseEvidence = proof;
  assert.throws(() => validate(root, record, 'release'), /Native VS Code QA/);
  record.nativeQA = { status: 'pass', evidence: proof };
  assert.equal(validate(root, record, 'release').status, 'pass');
  fs.writeFileSync(path.join(root, 'source.txt'), 'unreviewed mutation');
  assert.throws(() => validate(root, record, 'merge'), /stale/);
  fs.writeFileSync(path.join(root, 'source.txt'), 'reviewed source');
  fs.writeFileSync(path.join(root, 'proof.md'), 'changed proof');
  assert.throws(() => evidence(root, proof), /Evidence changed/);
});

test('source fingerprint covers additions, deletions and mode changes while gate records cannot hide scripts', t => {
  const { root, record, git } = fixture(t);
  fs.writeFileSync(path.join(root, 'docs/development/gates/test.json'), JSON.stringify(record));
  assert.equal(check(root).status, 'pass');
  fs.writeFileSync(path.join(root, 'untracked.txt'), 'new input');
  assert.notEqual(snapshot(root), record.sourceSha256); fs.unlinkSync(path.join(root, 'untracked.txt'));
  fs.chmodSync(path.join(root, 'source.txt'), 0o755); assert.notEqual(snapshot(root), record.sourceSha256);
  fs.chmodSync(path.join(root, 'source.txt'), 0o644);
  fs.unlinkSync(path.join(root, 'source.txt')); const deleted = snapshot(root);
  git('add', '-u'); assert.equal(snapshot(root), deleted);
  fs.writeFileSync(path.join(root, 'docs/development/gates/hidden.cjs'), 'code');
  assert.throws(() => snapshot(root), /regular JSON/);
  assert.throws(() => check(root, 'typo'), /Unknown admission/);
});

test('evidence traversal and symlink escapes fail closed', t => {
  const { root, proof } = fixture(t);
  assert.throws(() => evidence(root, { ...proof, path: '../proof.md' }), /Unsafe/);
  fs.symlinkSync(path.join(root, 'proof.md'), path.join(root, 'linked.md'));
  assert.throws(() => evidence(root, { ...proof, path: 'linked.md' }), /inside repository/);
});

test('VSIX verification rejects stale modules, extra modules and private/development files', t => {
  const { root } = fixture(t);
  const manifest = { name: 'persistent-terminal-tabs', publisher: 'maxtymosh', version: '1.0.0', main: './out/extension.js' };
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(manifest));
  fs.mkdirSync(path.join(root, 'out')); fs.writeFileSync(path.join(root, 'out/extension.js'), 'fresh');
  const bytes = s => Buffer.from(s);
  const files = { 'extension/package.json': bytes(JSON.stringify(manifest)), 'extension/out/extension.js': bytes('fresh') };
  assert.equal(verify(files, root).modules, 1);
  assert.throws(() => verify({ ...files, 'extension/out/extension.js': bytes('stale') }, root), /Stale/);
  assert.throws(() => verify({ ...files, 'extension/out/old.js': bytes('old') }, root), /module set/);
  for (const name of ['extension/.claude/tasks.md', 'extension/test/secret.cjs', 'extension/.env', 'extension/scripts/quality-gate.cjs', 'extension/unexpected.txt']) {
    assert.throws(() => verify({ ...files, [name]: bytes('private') }, root), /file shipped/);
  }
});
