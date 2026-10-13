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

import {readFileSync} from 'node:fs';
const painterSource=readFileSync(new URL('../src/lib/screenPainter.js', import.meta.url),'utf8');
const appSource=readFileSync(new URL('../src/App.jsx', import.meta.url),'utf8');
const sceneSource=readFileSync(new URL('../src/components/RetroComputer.jsx', import.meta.url),'utf8');
const lightSource=readFileSync(new URL('../src/components/RetroRoom.jsx', import.meta.url),'utf8');
assert(painterSource.includes("'DORADos'"));
assert(painterSource.includes("'/home/dorado/whoami'"));
assert(!appSource.includes("e.key.toLowerCase()==='f'"));
assert(appSource.includes('onContextMenu={e=>e.preventDefault()}'));
assert(sceneSource.includes('position={[-.23,.193,.473]}'));
assert(sceneSource.includes('leftButton.current.position.y'));
assert(sceneSource.includes('rightButton.current.position.y'));
assert(sceneSource.includes('CABLE_SEGMENTS'));
assert(lightSource.includes('function WindowSunlight()'));
assert(lightSource.includes('function RearWallWithOpening()'));
assert(lightSource.includes('<RearWallWithOpening/>'));
assert(!lightSource.includes('position={[0,1.75,-5.43]}'));
assert(lightSource.includes('position={[-4.22,3.10,-6.05]}'));
assert(lightSource.includes('castShadow') && lightSource.includes('shadow-mapSize'));
console.log('PASS: DORADos branding, disabled F, context menu, spacebar, wired mouse and sunlight shadows');

import {toneForKey} from '../src/lib/retroAudio.js';
import {statSync} from 'node:fs';
assert.deepEqual(toneForKey('KeyA'),toneForKey('KeyA'));
assert.notDeepEqual(toneForKey('KeyA'),toneForKey('KeyB'));
assert(toneForKey('KeyA').rate>0.94 && toneForKey('KeyA').rate<1.06);
for(const asset of ['mouse-down.mp3','mouse-up.mp3','keyboard.mp3','room.mp3']){
  assert(statSync(new URL('../public/audio/'+asset,import.meta.url)).size>500,asset+' is missing');
}
assert(sceneSource.includes('createMouseButtonTracker(playMouseDown,playMouseUp)'));
assert(sceneSource.includes("window.addEventListener('mousedown',down)"));
assert(sceneSource.includes("window.addEventListener('mouseup',up)"));
assert(!sceneSource.includes("window.addEventListener('pointerdown',down)"));
assert(sceneSource.includes('playKeyboard(e.code)'));
assert(sceneSource.includes('if(e.isComposing||e.repeat||pressed.current.has(e.code))return;'));
console.log('PASS: click-down/up audio assets, key-specific deterministic timbres, room ambience');

const htmlSource=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const styleSource=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
const audioSource=readFileSync(new URL('../src/lib/retroAudio.js',import.meta.url),'utf8');
const favicon=readFileSync(new URL('../public/favicon.png',import.meta.url));
assert(htmlSource.includes('<title>Marcos Dorado</title>'));
assert(htmlSource.includes('href="/favicon.png"'));
assert(!htmlSource.includes('/favicon.svg'));
assert(favicon.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
assert.equal(favicon.readUInt32BE(16),64);
assert.equal(favicon.readUInt32BE(20),64);
assert(favicon.includes(Buffer.from('tRNS')),'favicon must have real transparency');
assert(appSource.includes('className="sound-toggle"'));
assert(appSource.includes('setAudioMuted(next)'));
assert(appSource.includes('dorados-muted'));
assert(styleSource.includes('.sound-toggle{')&&styleSource.includes('position:fixed'));
assert(audioSource.includes('masterGain.gain.value = muted ? 0 : 1;'));
assert(audioSource.includes('volume.connect(masterGain)'));
console.log('PASS: mute controls, persistent preference, exact page title and transparent favicon');


import {screenRegionAtUv} from '../src/lib/screenHit.js';
const viewW=1200,viewH=900;
const next={x:448,y:799,w:116,h:37,action:'project-page',id:1};
const prev={x:316,y:799,w:116,h:37,action:'project-page',id:-1};
const uvAt=r=>({x:(r.x+r.w/2)/viewW,y:1-(r.y+r.h/2)/viewH});
assert.equal(screenRegionAtUv([next],uvAt(next),viewW,viewH),0);
assert.equal(screenRegionAtUv([prev,next],uvAt(next),viewW,viewH),1);
assert.equal(screenRegionAtUv([prev,next],uvAt(prev),viewW,viewH),0);
assert.equal(screenRegionAtUv([prev],uvAt(next),viewW,viewH),-1);
assert.equal(screenRegionAtUv([next],uvAt(prev),viewW,viewH),-1);
assert.equal(screenRegionAtUv([next],null,viewW,viewH),-1);
assert(sceneSource.includes('const pointerUv=useRef(null)'));
assert(sceneSource.includes('screenRegionAtUv(currentRegions,pointerUv.current,SW,SH)'));
assert(!sceneSource.includes('hovered.current=-1;redraw()'));
console.log('PASS: CRT hover stays with the cursor after pagination and disappears on disabled controls');
