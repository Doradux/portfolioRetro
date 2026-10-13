import assert from 'node:assert/strict';
import {makeMouseCableCurve,makeMouseCableDynamics,updateMouseCableCurve,
  COMPUTER_CABLE_CLEARANCE} from '../src/lib/mouseCable.js';

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


// The socket remains attached immediately, while flexible bends catch up
// progressively instead of translating rigidly with the mouse.
{
  const curve=makeMouseCableCurve(), dynamics=makeMouseCableDynamics();
  updateMouseCableCurve(curve,2.70,2.50,yaw,dynamics,1/60);
  const frontAtRest=curve.points[1].clone();
  const middleAtRest=curve.points[2].clone();
  const staticTarget=updateMouseCableCurve(makeMouseCableCurve(),3.03,2.89,yaw);
  updateMouseCableCurve(curve,3.03,2.89,yaw,dynamics,1/60);
  assert(Math.abs(curve.points[0].x-(3.03-Math.sin(yaw)*.426))<1e-9,
    'physical socket must always remain attached to moving mouse');
  assert(curve.points[1].distanceTo(staticTarget.points[1])>.20,
    'front flexible bend needs visible inertia in the first frame');
  assert(curve.points[2].distanceTo(staticTarget.points[2])>.20,
    'middle flexible bend should lag even farther behind');
  assert(curve.points[1].distanceTo(frontAtRest)<
    frontAtRest.distanceTo(staticTarget.points[1]),
    'front bend must not teleport to the new mouse position');
  assert(curve.points[2].distanceTo(middleAtRest)<
    middleAtRest.distanceTo(staticTarget.points[2]),
    'middle bend must not teleport to the new mouse position');
  for(let frame=0;frame<110;frame++)
    updateMouseCableCurve(curve,3.03,2.89,yaw,dynamics,1/60);
  assert(curve.points[1].distanceTo(staticTarget.points[1])<.015,
    'front bend must settle after releasing mouse');
  assert(curve.points[2].distanceTo(staticTarget.points[2])<.015,
    'middle loop must return to rest');
}

function assertRouteClear(curve, step){
  for(let i=0;i<=240;i++){
    const point=curve.getPoint(i/240);
    if(point.z>=safe.minZ&&point.z<=safe.maxZ){
      assert(point.x>=safe.safeX,
        'flexing cable entered PC side at frame '+step+': '+point.x);
    }
    assert(point.y>=-1.645,'flexing cable intersected desk at frame '+step);
    assert(Number.isFinite(point.x)&&Number.isFinite(point.y)&&Number.isFinite(point.z),
      'cable must remain finite');
  }
}
// Simulate repeated reversals + jitter at 30, 60 and 120 FPS.
for(const fps of [30,60,120]){
  const curve=makeMouseCableCurve(), dynamics=makeMouseCableDynamics();
  for(let step=0;step<420;step++){
    const x=2.70+.33*Math.sin(step*.105*60/fps);
    const z=2.52+.37*Math.sin(step*.081*60/fps);
    updateMouseCableCurve(curve,x,z,yaw,dynamics,1/fps);
    assertRouteClear(curve,step);
  }
}
console.log('PASS: elastic mouse cable follows with inertia at 30/60/120 FPS and never intersects PC');
