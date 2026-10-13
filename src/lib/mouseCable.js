import * as THREE from 'three';

// The computer occupies x=[-2.2,2.2], z=[-1.07,.94].
// The loose first section follows the mouse with inertia; the rest routes
// behind the computer without ever passing through the case.
const DEFAULT_POINTS=8;
export const COMPUTER_CABLE_CLEARANCE={maxX:2.2,minZ:-1.07,maxZ:.95,safeX:2.38};

export function makeMouseCableCurve(){
  return new THREE.CatmullRomCurve3(
    Array.from({length:DEFAULT_POINTS},()=>new THREE.Vector3()),
    false,'centripetal'
  );
}

export function makeMouseCableDynamics(){
  // Allocated just once: do not create new vectors every animation frame.
  return {
    initialized:false,
    front:new THREE.Vector3(),frontVelocity:new THREE.Vector3(),
    middle:new THREE.Vector3(),middleVelocity:new THREE.Vector3()
  };
}

// Implicit damped spring: stable across variable frame times and free of
// hard snaps when the player rapidly changes the mouse's direction.
function followElastic(position,velocity,targetX,targetY,targetZ,omega,delta){
  const dt=Math.min(.055,Math.max(.001,delta));
  const decay=1+2*omega*dt;
  const spring=omega*omega*dt*dt;
  const denominator=1/(decay+spring);
  for(let axis=0;axis<3;axis++){
    const target=axis===0?targetX:axis===1?targetY:targetZ;
    const previous=position.getComponent(axis);
    const previousVelocity=velocity.getComponent(axis);
    const updated=(decay*previous+dt*previousVelocity+spring*target)*denominator;
    const v=(previousVelocity+omega*omega*dt*(target-previous))*denominator;
    position.setComponent(axis,updated);
    velocity.setComponent(axis,v);
  }
}

export function updateMouseCableCurve(curve,mouseX,mouseZ,yaw,dynamics=null,delta=1/60){
  const originX=mouseX-Math.sin(yaw)*.426;
  const originZ=mouseZ-Math.cos(yaw)*.426;

  // The socket always follows the actual mouse, while both adjacent cable
  // bends trail independently: a soft sleeve first, then a slower loose loop.
  const frontX=Math.max(2.74,originX+.27);
  const frontZ=originZ-.37;
  const middleX=Math.max(2.78,mouseX+.12);
  const middleZ=1.23+(mouseZ-2.50)*.17;

  curve.points[0].set(originX,-1.487,originZ);
  if(dynamics){
    if(!dynamics.initialized){
      dynamics.front.set(frontX,-1.570,frontZ);
      dynamics.middle.set(middleX,-1.610,middleZ);
      dynamics.frontVelocity.set(0,0,0);
      dynamics.middleVelocity.set(0,0,0);
      dynamics.initialized=true;
    }else{
      // 12.5 / 7.5 rad/s: mouse-end bends readily, free loop settles later.
      followElastic(dynamics.front,dynamics.frontVelocity,
        frontX,-1.570,frontZ,12.5,delta);
      followElastic(dynamics.middle,dynamics.middleVelocity,
        middleX,-1.610,middleZ,7.5,delta);
    }
    // No transient overshoot into the computer body.
    dynamics.front.x=Math.max(2.68,dynamics.front.x);
    dynamics.middle.x=Math.max(2.72,dynamics.middle.x);
    curve.points[1].copy(dynamics.front);
    curve.points[2].copy(dynamics.middle);
  }else{
    curve.points[1].set(frontX,-1.570,frontZ);
    curve.points[2].set(middleX,-1.610,middleZ);
  }

  // The cable is supported on the tabletop and takes the long route along
  // the computer's right-hand side rather than clipping the cabinet.
  const flankX=Math.max(2.79,curve.points[2].x);
  curve.points[3].set(flankX,-1.615,.30);
  curve.points[4].set(flankX,-1.615,-.82);
  curve.points[5].set(2.62,-1.612,-1.43);
  curve.points[6].set(2.17,-1.605,-1.58);
  curve.points[7].set(1.72,-1.595,-1.65);
  return curve;
}
