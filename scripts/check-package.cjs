#!/usr/bin/env node
// Package once, then verify the actual VSIX bytes and write provenance. No install/publish.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const { unzipSync } = require('fflate');
const { hash } = require('./quality-gate.cjs');
const ROOT = path.resolve(__dirname, '..');

function verify(files, root) {
  const manifest = JSON.parse(Buffer.from(files['extension/package.json'] ?? []).toString());
  const expected = JSON.parse(fs.readFileSync(path.join(root, 'package.json')));
  for (const key of ['name', 'publisher', 'version', 'main']) if (manifest[key] !== expected[key]) throw new Error('VSIX manifest mismatch: ' + key);
  const expectedModules = fs.readdirSync(path.join(root, 'out')).filter(n => n.endsWith('.js')).sort();
  const actualModules = Object.keys(files).filter(n => n.startsWith('extension/out/') && n.endsWith('.js')).map(n => n.slice('extension/out/'.length)).sort();
  if (!expectedModules.length || JSON.stringify(expectedModules) !== JSON.stringify(actualModules)) throw new Error('Runtime module set differs');
  const publicFiles = new Set(['[Content_Types].xml', 'extension.vsixmanifest', 'extension/package.json',
    'extension/readme.md', 'extension/changelog.md', 'extension/LICENSE', 'extension/LICENSE.txt', 'extension/license',
    'extension/docs/agent-status.md', 'extension/scripts/check-live-status.py']);
  for (const name of Object.keys(files)) {
    if (!publicFiles.has(name) && !/^extension\/out\/[^/]+\.js$/.test(name)
      && !/^extension\/media\/[^/]+\.(?:svg|png)$/.test(name)) throw new Error('Development/private file shipped: ' + name);
  }
  for (const name of expectedModules) if (hash(files['extension/out/' + name]) !== hash(fs.readFileSync(path.join(root, 'out', name)))) throw new Error('Stale packaged runtime: ' + name);
  return { version: manifest.version, modules: expectedModules.length };
}

function main() {
  const out = path.join(ROOT, 'qa-artifacts'); fs.mkdirSync(out, { recursive: true });
  const name = `persistent-terminal-tabs-${JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'))).version}.vsix`;
  const vsix = path.join(out, name);
  cp.execFileSync(process.execPath, [require.resolve('@vscode/vsce/vsce'), 'package', '--no-dependencies', '--out', vsix], { cwd: ROOT, stdio: 'inherit' });
  const bytes = fs.readFileSync(vsix);
  const result = verify(unzipSync(bytes), ROOT);
  const record = { ...result, revision: cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(), sha256: hash(bytes), file: name };
  fs.writeFileSync(path.join(out, 'package-provenance.json'), JSON.stringify(record, null, 2) + '\n');
  console.log(JSON.stringify(record));
}
if (require.main === module) main();
module.exports = { verify };
