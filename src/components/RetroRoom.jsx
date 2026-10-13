import React, { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function WindowWithBlinds(){
  return <group position={[-4.22,2.17,-5.28]}>
    <mesh position={[0,0,.02]}><planeGeometry args={[3.08,3.04]}/><meshBasicMaterial color="#d6e5cf" toneMapped={false}/></mesh>
    <mesh position={[0,0,.029]}><planeGeometry args={[2.87,2.81]}/><meshBasicMaterial color="#f4d9ae" transparent opacity={.6} toneMapped={false}/></mesh>
    <mesh position={[-.92,-1.04,.04]}><boxGeometry args={[.64,.52,.01]}/><meshBasicMaterial color="#7e9e90" transparent opacity={.28}/></mesh>
    <mesh position={[.72,-.95,.04]}><boxGeometry args={[.84,.66,.01]}/><meshBasicMaterial color="#718f80" transparent opacity={.26}/></mesh>
    {[[-1.60,0,.17,3.46],[1.60,0,.17,3.46],[0,1.61,3.35,.16],[0,-1.61,3.35,.18]].map(([x,y,w,h],i)=><mesh key={i} castShadow position={[x,y,.13]}><boxGeometry args={[w,h,.26]}/><meshStandardMaterial color="#c8b99c" roughness={.86}/></mesh>)}
    <mesh castShadow position={[0,-1.69,.30]}><boxGeometry args={[3.56,.16,.55]}/><meshStandardMaterial color="#b8a88b" roughness={.83}/></mesh>
    <mesh castShadow position={[0,0,.16]}><boxGeometry args={[.083,3.04,.14]}/><meshStandardMaterial color="#d0c1a6"/></mesh>
    {Array.from({length:13},(_,i)=><group key={i} position={[0,1.33-i*.215,.24]}>
      <mesh castShadow rotation={[.34,0,0]}><boxGeometry args={[3.00,.085,.23]}/><meshStandardMaterial color={i%2?'#d2c7ad':'#e3d7bb'} roughness={.8}/></mesh>
      <mesh position={[0,-.095,.03]}><boxGeometry args={[2.94,.014,.05]}/><meshStandardMaterial color="#8a816d"/></mesh>
    </group>)}
    <mesh castShadow position={[0,1.55,.32]}><boxGeometry args={[3.20,.21,.36]}/><meshStandardMaterial color="#b8aa8f" roughness={.86}/></mesh>
    <mesh position={[1.37,-.30,.44]}><cylinderGeometry args={[.018,.018,1.78,8]}/><meshStandardMaterial color="#bdb5a0"/></mesh>
    <mesh position={[1.37,-1.18,.44]}><sphereGeometry args={[.054,12,12]}/><meshStandardMaterial color="#b6a78b"/></mesh>
  </group>;
}

const beamVertex="varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}";
const beamFragment="uniform float uTime; varying vec2 vUv; void main(){float edge=pow(max(0.,1.-abs(vUv.x-.5)*2.),1.3);float fade=sin(vUv.y*3.14159265);float a=edge*pow(max(0.,fade),.45)*(.92+.08*sin(uTime*.3+vUv.y*3.))*.115; gl_FragColor=vec4(vec3(1.,.85,.64),a);}";
function LightShafts({reducedMotion}){
 const mat=useMemo(()=>new THREE.ShaderMaterial({
   uniforms:{uTime:{value:0}},vertexShader:beamVertex,fragmentShader:beamFragment,
   transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,toneMapped:false
 }),[]);
 const geometries=useMemo(()=>{
   const arr=[];
   for(let k=0;k<7;k++)for(let layer=0;layer<3;layer++){
     const sx=-5.3+k*.34,sy=3.3-k*.075,sz=-4.99+layer*.10;
     const ex=-3.45+k*.41,ey=-1.54,ez=1.4+layer*.68;
     const width=.15+layer*.11;
     const geo=new THREE.BufferGeometry();
     geo.setAttribute('position',new THREE.Float32BufferAttribute([
       sx-width,sy,sz, sx+width,sy,sz, ex-width*2.5,ey,ez, ex+width*2.5,ey,ez
     ],3));
     geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,0,1,1,1],2));
     geo.setIndex([0,2,1,1,2,3]);geo.computeVertexNormals();arr.push(geo);
   }
   return arr;
 },[]);
 useEffect(()=>()=>{mat.dispose();geometries.forEach(g=>g.dispose());},[mat,geometries]);
 useFrame(({clock})=>{mat.uniforms.uTime.value=reducedMotion?0:clock.elapsedTime;});
 return <group>{geometries.map((g,i)=><mesh key={i} geometry={g} material={mat} frustumCulled={false} renderOrder={3}/>)}</group>;
}
const dustVertex="attribute float aPhase; attribute float aSpeed; uniform float uTime; varying float vBright; void main(){vec3 p=position;p.x+=sin(uTime*aSpeed+aPhase)*.11;p.y+=cos(uTime*aSpeed*.7+aPhase)*.10;p.z+=sin(uTime*aSpeed*.5+aPhase)*.11;vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp(24./max(1.,-mv.z),1.2,5.2);gl_Position=projectionMatrix*mv;vBright=.65+.35*sin(aPhase*2.+uTime*.4);}";
const dustFragment="varying float vBright;void main(){float a=pow(max(0.,1.-length(gl_PointCoord-.5)*2.),1.4)*vBright*.72;if(a<.015)discard;gl_FragColor=vec4(vec3(1.,.9,.7),a);}";
function DustMotes({reducedMotion}){
 const resources=useMemo(()=>{
   const total=390, pos=new Float32Array(total*3),phase=new Float32Array(total),speed=new Float32Array(total);
   let seed=1543;const rnd=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
   for(let i=0;i<total;i++){
     const t=rnd(),b=rnd();
     pos[i*3]=-5.2+t*(2.1+b*2.7)+(rnd()-.5)*1.4;
     pos[i*3+1]=3.8-t*5.2+(rnd()-.5)*1.4;
     pos[i*3+2]=-4.7+t*8.5+(rnd()-.5)*1.9;
     phase[i]=rnd()*6.283;speed[i]=.09+rnd()*.23;
   }
   const geo=new THREE.BufferGeometry();
   geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
   geo.setAttribute('aPhase',new THREE.BufferAttribute(phase,1));
   geo.setAttribute('aSpeed',new THREE.BufferAttribute(speed,1));
   const mat=new THREE.ShaderMaterial({vertexShader:dustVertex,fragmentShader:dustFragment,
     uniforms:{uTime:{value:0}},transparent:true,depthWrite:false,
     blending:THREE.AdditiveBlending,toneMapped:false});
   return {geo,mat};
 },[]);
 useEffect(()=>()=>{resources.geo.dispose();resources.mat.dispose();},[resources]);
 useFrame(({clock})=>{resources.mat.uniforms.uTime.value=reducedMotion?0:clock.elapsedTime;});
 return <points geometry={resources.geo} material={resources.mat} frustumCulled={false} renderOrder={4}/>;
}
function RoomDecor(){
 return <>
    <group position={[3.72,2.64,-5.05]}>
      <mesh castShadow receiveShadow position={[0,-.58,.15]}><boxGeometry args={[2.4,.13,.67]}/><meshStandardMaterial color="#4d3b2c" roughness={.92}/></mesh>
      {Array.from({length:9},(_,i)=><mesh key={i} castShadow position={[-1.01+i*.2,-.31,.14]} rotation={[0,0,(i%3-1)*.06]}>
       <boxGeometry args={[.135,.45+((i*7)%5)*.055,.34]}/>
       <meshStandardMaterial color={['#6a7b6a','#997f60','#758173','#a39779'][i%4]} roughness={1}/>
      </mesh>)}
      <mesh castShadow position={[.95,-.24,.13]}><cylinderGeometry args={[.16,.19,.46,12]}/><meshStandardMaterial color="#4b614d"/></mesh>
    </group>
    <mesh position={[0,-1.97,-5.14]} receiveShadow><boxGeometry args={[18,.24,.22]}/><meshStandardMaterial color="#554638" roughness={.9}/></mesh>
    <group position={[.16,2.42,-5.17]}>
      <mesh castShadow><boxGeometry args={[1.48,1.97,.12]}/><meshStandardMaterial color="#735d46" roughness={.9}/></mesh>
      <mesh position={[0,0,.067]}><planeGeometry args={[1.27,1.74]}/><meshStandardMaterial color="#7c8d7b" roughness={1}/></mesh>
      {[0,1,2,3].map(i=><mesh key={i} position={[0,.48-i*.27,.074]}><boxGeometry args={[.95,.014,.005]}/><meshBasicMaterial color="#c3d4b5" transparent opacity={.35}/></mesh>)}
      <mesh position={[0,-.4,.075]}><ringGeometry args={[.16,.17,32]}/><meshBasicMaterial color="#d5d0b1" transparent opacity={.5}/></mesh>
    </group>
    <group position={[3.35,-1.62,-.99]}>
      <mesh castShadow position={[0,.09,0]}><cylinderGeometry args={[.3,.34,.12,24]}/><meshStandardMaterial color="#545d51" metalness={.35} roughness={.46}/></mesh>
      <mesh castShadow position={[-.06,.76,-.05]} rotation={[0,0,.19]}><cylinderGeometry args={[.05,.06,1.5,12]}/><meshStandardMaterial color="#8c8c77" metalness={.45} roughness={.42}/></mesh>
      <mesh castShadow position={[-.4,1.51,.1]} rotation={[0,0,-.47]}><cylinderGeometry args={[.15,.47,.60,32,1,true]}/><meshStandardMaterial color="#b7b49e" side={THREE.DoubleSide} roughness={.7}/></mesh>
      <pointLight position={[-.4,1.28,.25]} intensity={2.6} distance={3.5} color="#ffc790"/>
    </group>
 </>;
}
export default function RetroRoom({reducedMotion=false}){
 return <>
   <color attach="background" args={['#292820']}/>
   <fog attach="fog" args={['#292820',14,29]}/>
   <ambientLight intensity={1.05} color="#cdbfa7"/>
   <hemisphereLight args={['#e6ceab','#36362d',.75]}/>
   <directionalLight position={[-4.7,5.3,-1.2]} intensity={2.8} color="#ffe4b0" castShadow shadow-mapSize={[2048,2048]} shadow-bias={-.0003} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8}/>
   <spotLight position={[-4.6,4.1,-3.9]} color="#ffdfa8" intensity={40} distance={18} angle={.52} penumbra={.83}/>
   <pointLight position={[1.8,1.7,2.3]} color="#abcfab" intensity={5} distance={7}/>
   <pointLight position={[4.2,3.6,-3.8]} color="#ffd7a9" intensity={7} distance={8}/>
   <mesh receiveShadow position={[0,1.75,-5.43]}><planeGeometry args={[18,11]}/><meshStandardMaterial color="#524b42" roughness={1}/></mesh>
   <mesh receiveShadow position={[-8.5,1.75,0]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[14,11]}/><meshStandardMaterial color="#343830" roughness={1}/></mesh>
   <mesh receiveShadow position={[8.5,1.75,0]} rotation={[0,-Math.PI/2,0]}><planeGeometry args={[14,11]}/><meshStandardMaterial color="#353a33" roughness={1}/></mesh>
   <mesh receiveShadow position={[0,-2.47,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[50,50]}/><meshStandardMaterial color="#292d27" roughness={.98}/></mesh>
   <mesh position={[0,7,0]} rotation={[Math.PI/2,0,0]}><planeGeometry args={[18,16]}/><meshStandardMaterial color="#49473f" roughness={1}/></mesh>
   <mesh receiveShadow castShadow position={[0,-1.77,.57]}><boxGeometry args={[11.5,.21,7.2]}/><meshStandardMaterial color="#4c4031" roughness={.87}/></mesh>
   <mesh receiveShadow position={[0,-1.95,4.16]}><boxGeometry args={[11.5,.22,.09]}/><meshStandardMaterial color="#332f27"/></mesh>
   <WindowWithBlinds/>
   <RoomDecor/>
   <LightShafts reducedMotion={reducedMotion}/>
   <DustMotes reducedMotion={reducedMotion}/>
 </>;
}
