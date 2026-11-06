const { test } = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

let calls = [], available = true, failMove = false;
const original = Module._load;
Module._load = function(name, ...args) {
  if (name === 'vscode') return {commands:{
    getCommands:async()=>available?['vscode.moveViews']:[],
    executeCommand:async(...args)=>{calls.push(args);if(failMove)throw Error('move unavailable');}
  }};
  return original.call(this,name,...args);
};
const { hasExistingPttState, initializeViewLocation, dockBesideTerminal } = require('../out/view-location');
Module._load = original;
const state = () => {
  const data = new Map();
  return {get:key=>data.get(key),update:async(key,value)=>{data.set(key,value);}};
};
function reset(){calls=[];available=true;failMove=false;}

test('fresh install shares the Terminal container once; later user moves and reloads stay untouched',async()=>{
  reset(); const storage=state();
  assert.equal(await initializeViewLocation(storage,false),'docked');
  assert.deepEqual(calls,[['vscode.moveViews',{viewIds:['terminalTabs.tree'],destinationId:'workbench.panel.terminal'}]]);
  calls=[]; // User may now drag the view elsewhere; a new activation must not move it back.
  assert.equal(await initializeViewLocation(storage,false),'unchanged');
  assert.deepEqual(calls,[]);
});

test('upgrading legacy users preserves their layout and records the migration even on an empty workspace',async()=>{
  reset();const storage=state();
  assert.equal(await initializeViewLocation(storage,true),'preserved');
  assert.equal(await initializeViewLocation(storage,false),'unchanged');
  assert.deepEqual(calls,[]);
});

test('unsupported commands, failed moves and missing storage never cause repeated startup moves',async()=>{
  reset();available=false;const unsupported=state();
  assert.equal(await initializeViewLocation(unsupported,false),'unavailable');
  available=true;
  assert.equal(await initializeViewLocation(unsupported,false),'unchanged');
  failMove=true;const failed=state();
  assert.equal(await initializeViewLocation(failed,false),'failed');
  failMove=false;calls=[];
  assert.equal(await initializeViewLocation(failed,false),'unchanged');
  assert.equal(await initializeViewLocation(undefined,false),'unchanged');
  assert.deepEqual(calls,[]);
  assert.equal(await dockBesideTerminal(),true,'explicit command can recover after a failed first attempt');
});

test('old global state or workspace slices identify upgrades; diagnostics alone do not',()=>{
  const home=fs.mkdtempSync(path.join(os.tmpdir(),'ptt-layout-state-'));
  try {
    assert.equal(hasExistingPttState(home),false);
    const root=path.join(home,'.terminal-tabs');fs.mkdirSync(root);
    fs.writeFileSync(path.join(root,'diag.log'),'');
    assert.equal(hasExistingPttState(home),false);
    fs.writeFileSync(path.join(root,'state.json'),'{}');
    assert.equal(hasExistingPttState(home),true);
    fs.unlinkSync(path.join(root,'state.json'));fs.mkdirSync(path.join(root,'workspaces'));
    assert.equal(hasExistingPttState(home),true);
  }finally{fs.rmSync(home,{recursive:true,force:true});}
});

test('the shortcut focuses the actual view and a manual docking command remains discoverable',()=>{
  const { contributes }=require('../package.json');
  assert.ok(contributes.keybindings.some(b=>b.command==='terminalTabs.tree.focus'&&b.mac==='cmd+alt+t'));
  assert.ok(contributes.commands.some(c=>c.command==='terminalTabs.dockBesideTerminal'));
  assert.ok(contributes.views.terminalTabs.some(v=>v.id==='terminalTabs.tree'),'retain stable view identity for upgrades');
});
