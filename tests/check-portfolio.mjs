import assert from 'node:assert/strict';
import {projects} from '../src/lib/projectCatalog.js';
import {KEY_LAYOUT} from '../src/lib/keyboardLayout.js';

assert.equal(projects.length,35);
assert.equal(new Set(projects.map(p=>p.id)).size,projects.length);
assert.equal(projects.filter(p=>p.repo).length,33);
assert.equal(projects.filter(p=>p.visibility==='private').length,13);
assert.equal(projects.filter(p=>p.visibility==='public').length,20);
assert.equal(projects.filter(p=>['professional','local'].includes(p.visibility)).length,2);
assert(!projects.some(p=>p.id.toLowerCase()==='hist'||p.repo?.toLowerCase()==='hist'));
for(const [index,p] of projects.entries()){
  assert.equal(p.number,String(index+1).padStart(2,'0'));
  if(p.visibility==='private'||p.visibility==='professional'||p.visibility==='local')assert.equal(p.link,null);
  if(p.visibility==='public')assert(p.link?.startsWith('https://github.com/Doradux/'));
}
const key=code=>{
  const matching=KEY_LAYOUT.filter(k=>k.code===code);
  assert.equal(matching.length,1,'Expected one physical keycap for '+code);
  return matching[0];
};
const left=key('ArrowLeft'), down=key('ArrowDown'), right=key('ArrowRight'), up=key('ArrowUp');
assert(left.x<down.x&&down.x<right.x);
assert(Math.abs(left.z-down.z)<.0001&&Math.abs(down.z-right.z)<.0001);
assert(Math.abs(up.x-down.x)<.0001&&up.z<down.z);
assert(key('Numpad2').x>1.4);
assert(key('Numpad0').scale[0]>1.5);
assert.equal(KEY_LAYOUT.filter(k=>k.code==='Space').length,0,'spacebar is a separate mesh');
console.log('PASS: 35 projects, 33 GitHub repos, no hist, safe private links');
console.log('PASS: left/down/right with up above down, independent numeric keypad');
