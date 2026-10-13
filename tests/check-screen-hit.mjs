import assert from 'node:assert/strict';
import {crtSampleUv,screenRegionAtUv} from '../src/lib/screenHit.js';

// Invert the shader UV sample to find precisely where any canvas pixel
// actually appears on the curved monitor's physical glass.
function rawUvForVisiblePixel(x,y,time,effects=true) {
  const goal={x:x/1200,y:1-y/900};
  const raw={...goal};
  if(effects) {
    for(let i=0;i<16;i++){
      const sample=crtSampleUv(raw,true,time);
      raw.x += goal.x - sample.x;
      raw.y += goal.y - sample.y;
    }
  }
  return raw;
}
const next={x:448,y:799,w:116,h:37,action:'project-page',id:1};
const previous={x:316,y:799,w:116,h:37,action:'project-page',id:-1};
const back={x:313,y:306,w:375,h:44,action:'projects',id:'back'};
for(const time of [0,3,10,45,100]){
  for(const rect of [next,previous,back]){
    // The visible top, center and bottom of the button are all clickable.
    for(const offset of [2,rect.h/2,rect.h-2]){
      const uv=rawUvForVisiblePixel(rect.x+rect.w/2,rect.y+offset,time);
      const point=crtSampleUv(uv,true,time);
      assert(Math.abs(point.x-(rect.x+rect.w/2)/1200)<1e-9);
      assert(Math.abs(point.y-(1-(rect.y+offset)/900))<1e-9);
      assert.equal(screenRegionAtUv([rect],uv,1200,900,true,time),0,
        'visible button must click: '+rect.id+' at '+offset+' time '+time);
    }
    // The apparent pixels outside the drawn rounded button are NOT clickable.
    for(const offset of [-6,rect.h+6]){
      const uv=rawUvForVisiblePixel(rect.x+rect.w/2,rect.y+offset,time);
      assert.equal(screenRegionAtUv([rect],uv,1200,900,true,time),-1,
        'outside button must not click: '+rect.id+' at '+offset+' time '+time);
    }
  }
}
const visibleNextTop=rawUvForVisiblePixel(next.x+next.w/2,next.y+2,3);
const belowNext=rawUvForVisiblePixel(next.x+next.w/2,next.y+next.h+3,3);
// Regression for the actual bug: the unwarped UV misses the visible top,
// and accepts a click BELOW the visible bottom instead.
assert.equal(screenRegionAtUv([next],visibleNextTop,1200,900),-1);
assert.equal(screenRegionAtUv([next],belowNext,1200,900),0);
assert.equal(screenRegionAtUv([next],visibleNextTop,1200,900,true,3),0);
assert.equal(screenRegionAtUv([next],belowNext,1200,900,true,3),-1);
// Turning the CRT effects off must return to the regular screen UV mapping.
const unwarped=rawUvForVisiblePixel(next.x+next.w/2,next.y+2,3,false);
assert.deepEqual(crtSampleUv(unwarped,false,3),unwarped);
assert.equal(screenRegionAtUv([next],unwarped,1200,900,false,3),0);
assert.equal(screenRegionAtUv([next],null,1200,900,true,3),-1);
console.log('PASS: CRT shader-aligned hitboxes for PREV, NEXT and BACK across effects and scan times');
