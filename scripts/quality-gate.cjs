#!/usr/bin/env node
// Exact-source engineering admission, adapted from Shuttle's development-quality gate.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const RECORDS = 'docs/development/gates/';
const CHECKS = ['review', 'tests', 'behavior', 'dependencyAudit', 'maps', 'ownership', 'acceptance'];
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const git = (root, ...args) => cp.execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();

function snapshot(root) {
  const names = cp.execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
  const digest = crypto.createHash('sha256');
  for (const name of [...new Set(names)].sort()) {
    const file = path.join(root, name);
    let stat;
    // A tracked deletion hashes as the resulting tree, before and after commit.
    try { stat = fs.lstatSync(file); } catch (e) { if (e.code === 'ENOENT') continue; throw e; }
    if (name.startsWith(RECORDS)) {
      if (!name.endsWith('.json') || !stat.isFile() || stat.isSymbolicLink()) throw new Error('Gate records must be regular JSON');
      continue;
    }
    const mode = stat.isSymbolicLink() ? 'link' : stat.mode & 0o111 ? 'executable' : 'file';
    const data = stat.isSymbolicLink() ? fs.readlinkSync(file) : fs.readFileSync(file);
    digest.update(name + '\0' + mode + '\0' + hash(data) + '\0');
  }
  return digest.digest('hex');
}

function evidence(root, value) {
  if (!value || typeof value.path !== 'string' || !/^[a-f0-9]{64}$/.test(value.sha256 ?? '')) throw new Error('Evidence needs path and sha256');
  const relative = value.path;
  if (path.isAbsolute(relative) || relative.includes('\\') || relative.split('/').includes('..') || relative.startsWith(RECORDS)) throw new Error('Unsafe evidence path');
  const file = path.join(root, relative);
  if (!fs.lstatSync(file).isFile() || fs.lstatSync(file).isSymbolicLink() || !fs.realpathSync(file).startsWith(fs.realpathSync(root) + path.sep)) throw new Error('Evidence must stay inside repository');
  if (hash(fs.readFileSync(file)) !== value.sha256) throw new Error('Evidence changed: ' + relative);
}

function validate(root, record, phase) {
  if (record.schema !== 1 || record.sourceSha256 !== snapshot(root)) throw new Error('Missing schema or stale source evidence');
  for (const key of ['task', 'scope', 'reviewer']) if (typeof record[key] !== 'string' || !record[key].trim()) throw new Error('Missing ' + key);
  if (record.verdict !== 'Ship') throw new Error('Review verdict must be Ship');
  if (!/^[a-f0-9]{40}$/.test(record.baseRevision ?? '')) throw new Error('Full reviewed baseRevision required');
  git(root, 'merge-base', '--is-ancestor', record.baseRevision, 'HEAD');
  for (const name of CHECKS) {
    const check = record.checks?.[name];
    if (check?.status !== 'pass') throw new Error('Required check missing, failed or blocked: ' + name);
    evidence(root, check.evidence);
  }
  if (phase === 'release') {
    if (record.releaseVerdict !== 'Ship') throw new Error('Separate release verdict required');
    if (record.nativeQA?.status !== 'pass') throw new Error('Native VS Code QA has not passed');
    evidence(root, record.nativeQA.evidence);
    evidence(root, record.releaseEvidence);
  }
  return { task: record.task, phase, status: 'pass' };
}

function check(root, phase = 'merge', explicit) {
  if (!['merge', 'release'].includes(phase)) throw new Error('Unknown admission phase');
  const dir = path.join(root, RECORDS);
  const files = explicit ? [path.resolve(root, explicit)] : fs.existsSync(dir) ? fs.readdirSync(dir).filter(n => n.endsWith('.json')).map(n => path.join(dir, n)) : [];
  const failures = [];
  for (const file of files) {
    try {
      if (fs.lstatSync(file).isSymbolicLink() || !fs.realpathSync(file).startsWith(fs.realpathSync(root) + path.sep)) throw new Error('Unsafe gate record');
      return { ...validate(root, JSON.parse(fs.readFileSync(file)), phase), record: path.relative(root, file) };
    } catch (e) { failures.push(path.basename(file) + ': ' + e.message); }
  }
  throw new Error('Engineering admission refused: ' + (failures.join('; ') || 'no evidence record'));
}

function merge(root, number) {
  if (!Number.isSafeInteger(number) || number < 1) throw new Error('Positive PR number required');
  if (git(root, 'status', '--porcelain')) throw new Error('Commit exact reviewed inputs first');
  const result = check(root);
  const head = git(root, 'rev-parse', 'HEAD');
  const repo = 'maxtymosh/persistent-terminal-tabs';
  git(root, 'fetch', 'origin', 'main');
  git(root, 'merge-base', '--is-ancestor', 'origin/main', head);
  const pr = JSON.parse(cp.execFileSync('gh', ['pr', 'view', String(number), '--repo', repo, '--json', 'headRefOid,baseRefName,statusCheckRollup'], { encoding: 'utf8', cwd: root }));
  if (pr.headRefOid !== head || pr.baseRefName !== 'main') throw new Error('PR must match exact HEAD and target main');
  const checks = pr.statusCheckRollup ?? [];
  if (!checks.some(c => c.name === 'Quality' && c.conclusion === 'SUCCESS') || checks.some(c => !['SUCCESS', 'SKIPPED', 'NEUTRAL'].includes(c.conclusion))) throw new Error('Exact-revision CI is pending or failed');
  check(root);
  cp.execFileSync('gh', ['pr', 'merge', String(number), '--repo', repo, '--merge', '--match-head-commit', head], { cwd: root, stdio: 'inherit' });
  return result;
}

if (require.main === module) {
  try {
    const [action, value] = process.argv.slice(2);
    const result = action === 'snapshot' ? { sourceSha256: snapshot(ROOT) }
      : action === 'check' ? check(ROOT, value ?? 'merge')
        : action === 'merge' ? merge(ROOT, Number(value)) : (() => { throw new Error('Use snapshot, check [merge|release], or merge PR_NUMBER'); })();
    if (action === 'check' && !['merge', 'release', undefined].includes(value)) throw new Error('Unknown admission phase');
    console.log(JSON.stringify(result));
  } catch (e) { console.error(e.message); process.exitCode = 1; }
}

module.exports = { snapshot, evidence, validate, check, merge, hash, CHECKS };
