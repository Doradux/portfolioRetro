import * as THREE from 'three';

// Route the cable *beside* the computer, then behind its rear wall.
// The beige computer base occupies x=[-2.2,2.2], z=[-1.06,.94].
// A smooth single spline avoids the previous line cutting diagonally
// through that physical volume on its way to the rear connector.
const DEFAULT_POINTS=8;
export const COMPUTER_CABLE_CLEARANCE={maxX:2.2,minZ:-1.07,maxZ:.95,safeX:2.38};
export function makeMouseCableCurve(){
  return new THREE.CatmullRomCurve3(
    Array.from({length:DEFAULT_POINTS},()=>new THREE.Vector3()),
    false,'centripetal'
  );
}
export function updateMouseCableCurve(curve,mouseX,mouseZ,yaw){
  const sideX=Math.max(2.73,mouseX+.10);
  const originX=mouseX-Math.sin(yaw)*.426;
  const originZ=mouseZ-Math.cos(yaw)*.426;
  // Follow the movable socket without poking through the mouse shell.
  curve.points[0].set(originX,-1.487,originZ);
  curve.points[1].set(Math.max(2.66,originX+.28),-1.552,originZ-.40);
  curve.points[2].set(sideX,-1.605,1.10);
  curve.points[3].set(sideX,-1.615,.30);
  curve.points[4].set(sideX,-1.615,-.82);
  // Only bend inwards after clearing the rear of the computer.
  curve.points[5].set(2.62,-1.612,-1.43);
  curve.points[6].set(2.17,-1.605,-1.58);
  curve.points[7].set(1.72,-1.595,-1.65);
  return curve;
}
