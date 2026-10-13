import assert from 'node:assert/strict';
import {makeMouseCableCurve,updateMouseCableCurve,COMPUTER_CABLE_CLEARANCE} from '../src/lib/mouseCable.js';

const safe=COMPUTER_CABLE_CLEARANCE;
const yaw=.24;
let checked=0;
for(let xi=0;xi<=8;xi++) {
  for(let zi=0;zi<=8;zi++) {
    const x=2.37+(3.03-2.37)*xi/8;
    const z=2.15+(2.89-2.15)*zi/8;
    const curve=updateMouseCableCurve(makeMouseCableCurve(),x,z,yaw);
    assert.equal(curve.points.length,8);
    const socket=curve.getPoint(0);
    assert(Math.abs(socket.x-(x-Math.sin(yaw)*.426))<1e-9,'cord leaves rotated mouse nose');
    assert(Math.abs(socket.z-(z-Math.cos(yaw)*.426))<1e-9,'cord stays attached on mouse movement');
    const end=curve.getPoint(1);
    assert(end.z<safe.minZ-.30,'plug must terminate behind computer');
    for(let i=0;i<=500;i++){
      const p=curve.getPoint(i/500);
      if(p.z>=safe.minZ&&p.z<=safe.maxZ){
        assert(p.x>=safe.safeX,
          'cord must not cross PC at mouse('+x+','+z+') curve('+p.x+','+p.z+')');
      }
      assert(p.y>=-1.645,'cable should remain supported just above desktop');
    }
    checked++;
  }
}
console.log('PASS: mouse cable clears PC case in '+checked+' positions, remains attached and routes behind cabinet');
