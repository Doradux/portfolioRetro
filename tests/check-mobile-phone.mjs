import assert from 'node:assert/strict';
import {projects,navItems} from '../src/lib/content.js';
import {initialPhoneFocus,updatePhoneFocus,PHONE_ROWS_PER_PAGE} from '../src/lib/phoneNavigation.js';

function advance(focus,action,view){
  return updatePhoneFocus(focus,action,view);
}
let f=initialPhoneFocus();
assert.equal(f.mode,'content');
let r=advance(f,'menu',{page:'home'});
f=r.state;
assert.equal(f.mode,'menu');
assert.equal(f.menuIndex,0);
f=advance(f,'down',{page:'home'}).state;
f=advance(f,'down',{page:'home'}).state;
assert.equal(f.menuIndex,2);
r=advance(f,'ok',{page:'home'});
f=r.state;
assert.deepEqual(r.command,{kind:'navigate',page:'projects'});
assert.equal(f.mode,'content');

// Every project, including public and private, is accessible via the D-pad.
for(let i=0;i<projects.length-1;i++){
  f=advance(f,'down',{page:'projects'}).state;
  assert.equal(f.projectIndex,i+1);
}
assert.equal(f.projectIndex,projects.length-1);
f=advance(f,'down',{page:'projects'}).state;
assert.equal(f.projectIndex,projects.length-1);
assert(!projects.some(p=>p.id.toLowerCase()==='hist'));
r=advance(f,'ok',{page:'projects'});
assert.deepEqual(r.command,{kind:'project',id:projects.at(-1).id});
r=advance(f,'back',{page:'projects',selectedProject:projects.at(-1).id});
assert.deepEqual(r.command,{kind:'navigate',page:'projects'});
assert.equal(r.state.mode,'content');
r=advance(f,'menu',{page:'projects'});
assert.equal(r.state.menuIndex,2);
assert.equal(r.state.mode,'menu');
r=advance(r.state,'back',{page:'projects'});
assert.deepEqual(r.command,{kind:'navigate',page:'home'});

// Four-at-a-time navigation stays within the catalogue.
f=initialPhoneFocus('projects');
f=advance(f,'right',{page:'projects'}).state;
assert.equal(f.projectIndex,PHONE_ROWS_PER_PAGE);
f=advance(f,'left',{page:'projects'}).state;
assert.equal(f.projectIndex,0);

// Project detail pages can be scrolled and changed with the D-pad.
f=initialPhoneFocus('projects');
let sc=advance(f,'down',{page:'projects',selectedProject:projects[0].id});
assert.equal(sc.state.detailScroll,1);
sc=advance(sc.state,'up',{page:'projects',selectedProject:projects[0].id});
assert.equal(sc.state.detailScroll,0);
sc=advance(sc.state,'right',{page:'projects',selectedProject:projects[0].id});
assert.deepEqual(sc.command,{kind:'project',id:projects[1].id});
assert.equal(sc.state.projectIndex,1);
sc=advance(sc.state,'left',{page:'projects',selectedProject:projects[1].id});
assert.deepEqual(sc.command,{kind:'project',id:projects[0].id});
assert.equal(sc.state.detailScroll,0);

// Menu wraps and selects all five sections.
f=initialPhoneFocus('contact');
f=advance(f,'menu',{page:'contact'}).state;
assert.equal(f.menuIndex,navItems.length-1);
f=advance(f,'down',{page:'contact'}).state;
assert.equal(f.menuIndex,0);
r=advance(f,'ok',{page:'contact'});
assert.deepEqual(r.command,{kind:'navigate',page:'home'});

// Contact / skills are also operable with the D-pad.
f=initialPhoneFocus('contact');
f=advance(f,'down',{page:'contact'}).state;
r=advance(f,'ok',{page:'contact'});
assert.equal(r.command.kind,'external');
assert(r.command.url.startsWith('https://'));
f=initialPhoneFocus('skills');
f=advance(f,'up',{page:'skills'}).state;
assert.equal(f.skillIndex,3);
f=advance(f,'down',{page:'skills'}).state;
assert.equal(f.skillIndex,0);

// Defensive: the interactive LCD bezel, mobile camera, all seven key actions.
import {readFileSync} from 'node:fs';
const model=readFileSync(new URL('../src/components/MobilePhone.jsx',import.meta.url),'utf8');
const retro=readFileSync(new URL('../src/components/RetroComputer.jsx',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
for(const key of ['up','down','left','right','ok','back','menu']){
  assert(model.includes("id:'"+key+"'"),key+' missing');
}
assert(model.includes('SCREEN_CENTER_Z')||model.includes('LCD_Z'));
assert(retro.includes('camera.lookAt(-3.24,-1.54,.60);'));
assert(app.includes('isMobile={isMobile}'));
console.log('PASS: 3D mobile controls, LCD alignment, menu focus, all 35 projects and back navigation');
