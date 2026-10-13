import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import RetroRoom from './RetroRoom.jsx';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as THREE from 'three';
import { drawScreen, SW, SH } from '../lib/screenPainter.js';

const vertexShader = "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}";
const fragmentShader = "\nuniform sampler2D uMap;\nuniform float uTime;\nuniform float uEffects;\nvarying vec2 vUv;\nfloat rnd(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}\nvoid main(){\n vec2 c=vUv*2.0-1.0;\n vec2 uv=vUv+c*dot(c,c)*.029*uEffects;\n float roll=fract(uTime*.061);\n float band=exp(-pow((uv.y-roll)*28.,2.));\n uv.x+=(.0014*sin(uv.y*21.5-uTime*1.37)+.0008*sin(uv.y*59.+uTime*.65)+.0030*band)*uEffects;\n float rgb=.00145*uEffects;\n vec3 color=vec3(texture2D(uMap,uv+vec2(rgb,0.)).r,texture2D(uMap,uv).g,texture2D(uMap,uv-vec2(rgb,0.)).b);\n float scan=1.-.065*(.5+.5*cos(uv.y*900.*3.14159));\n color*=mix(1.,scan*(.97+.03*sin(uv.x*1200.*3.14159)),uEffects);\n color+=(rnd(floor(uv*vec2(1200.,900.))+floor(uTime*24.))-.5)*.013*uEffects;\n color+=vec3(.018,.039,.022)*band*uEffects;\n color*=1.-.26*pow(clamp(length(c)/1.42,0.,1.),1.7);\n float refl=pow(max(0.,1.-length((vUv-vec2(.12,.94))*vec2(.75,1.3))),7.);\n color+=vec3(.035,.055,.055)*refl;\n color*=step(.003,uv.x)*step(.003,uv.y)*step(uv.x,.997)*step(uv.y,.997);\n gl_FragColor=vec4(color,1.0);\n #include <tonemapping_fragment>\n #include <colorspace_fragment>\n}\n";
const cream = '#cdc5a9';
const lightCream = '#e2dcc6';

function Plastic({size,position,rotation=[0,0,0],radius=.10,color=cream,children,...rest}){
  const geometry=useMemo(()=>new RoundedBoxGeometry(size[0],size[1],size[2],4,radius),[...size,radius]);
  return <mesh geometry={geometry} position={position} rotation={rotation} castShadow receiveShadow {...rest}>
    <meshStandardMaterial color={color} roughness={.82} metalness={.02}/>{children}
  </mesh>;
}

function Keyboard(){
  const keys=useRef();
  const dummy=useMemo(()=>new THREE.Object3D(),[]);
  const count=104;
  useLayoutEffect(()=>{
    let i=0;
    for(let row=0;row<6;row++){
      for(let col=0;col<16;col++){
        dummy.position.set(-1.48+col*.196,.212,-.42+row*.18);
        dummy.scale.set(.95,1,.92);dummy.updateMatrix();
        keys.current.setMatrixAt(i++,dummy.matrix);
      }
    }
    for(let col=0;col<8;col++){
      dummy.position.set(1.77+(col%4)*.166,.212,-.41+Math.floor(col/4)*.18);
      dummy.scale.set(.75,1,.9);dummy.updateMatrix();
      keys.current.setMatrixAt(i++,dummy.matrix);
    }
    keys.current.instanceMatrix.needsUpdate=true;
  },[dummy]);
  return <group position={[-.23,-1.49,2.38]} rotation={[-.10,-.02,0]}>
    <Plastic size={[4.17,.22,1.36]} position={[.13,0,.05]} radius={.11} color={lightCream}/>
    <Plastic size={[4.04,.05,1.18]} position={[.12,.122,.03]} radius={.04} color="#b4af98"/>
    <instancedMesh ref={keys} args={[undefined,undefined,count]} castShadow receiveShadow>
      <boxGeometry args={[.164,.092,.153]}/><meshStandardMaterial color="#eae5d2" roughness={.9}/>
    </instancedMesh>
    <Plastic size={[.93,.091,.16]} position={[-.11,.234,.466]} radius={.03} color="#c1baa5"/>
  </group>;
}

function ComputerBase(){
  return <group position={[0,-1.38,-.22]}>
    <Plastic size={[4.40,.43,1.68]} position={[0,0,0]} radius={.09} color="#c3bba0"/>
    <Plastic size={[4.12,.265,.1]} position={[0,.012,.85]} radius={.024} color="#b4ae94"/>
    <Plastic size={[1.57,.047,.016]} position={[-.9,.057,.91]} radius={.012} color="#51564d"/>
    <Plastic size={[1.19,.10,.04]} position={[.78,-.05,.918]} radius={.025} color="#979481"/>
    <mesh position={[1.79,-.025,.935]}><sphereGeometry args={[.035,16,16]}/><meshBasicMaterial color="#a5e68c"/></mesh>
    {Array.from({length:8}).map((_,i)=><mesh key={i} position={[-1.94+i*.095,-.14,.917]}>
      <boxGeometry args={[.055,.017,.016]}/><meshStandardMaterial color="#707164"/>
    </mesh>)}
  </group>;
}
function Monitor({page,selectedProject,onNavigate,onProject,effects,onEffectsToggle}){
  const canvas=useMemo(()=>{const c=document.createElement('canvas');c.width=SW;c.height=SH;return c;},[]);
  const texture=useMemo(()=>{const t=new THREE.CanvasTexture(canvas);t.anisotropy=8;t.colorSpace=THREE.SRGBColorSpace;return t;},[canvas]);
  const regions=useRef([]), hovered=useRef(-1);
  const shader=useMemo(()=>new THREE.ShaderMaterial({
    uniforms:{uMap:{value:texture},uTime:{value:0},uEffects:{value:1}},
    vertexShader,fragmentShader,side:THREE.FrontSide,toneMapped:false
  }),[texture]);
  const screenGeo=useMemo(()=>{
    const geo=new THREE.PlaneGeometry(3.54,2.65,48,48),p=geo.attributes.position;
    for(let i=0;i<p.count;i++){const x=p.getX(i)/1.77,y=p.getY(i)/1.325;p.setZ(i,.10*(1-x*x)*(1-y*y));}
    geo.computeVertexNormals();return geo;
  },[]);
  function redraw(){regions.current=drawScreen(canvas,page,selectedProject,hovered.current);texture.needsUpdate=true;}
  useEffect(()=>{
    hovered.current=-1;redraw();document.fonts.ready.then(redraw);
  },[page,selectedProject,canvas,texture]);
  useEffect(()=>()=>{shader.dispose();texture.dispose();screenGeo.dispose();},[shader,texture,screenGeo]);
  useFrame(({clock})=>{shader.uniforms.uTime.value=clock.elapsedTime;shader.uniforms.uEffects.value=effects?1:0;});
  function hit(e){
    if(!e.uv)return -1;
    const x=e.uv.x*SW,y=(1-e.uv.y)*SH;
    return regions.current.findIndex(r=>x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h);
  }
  function move(e){
    e.stopPropagation();const idx=hit(e);
    if(idx!==hovered.current){hovered.current=idx;redraw();document.body.style.cursor=idx>=0?'pointer':'auto';}
  }
  function click(e){
    e.stopPropagation();const idx=hit(e);if(idx<0)return;
    const r=regions.current[idx];
    if(r.action==='project')onProject(r.id);
    else if(r.action==='external'){
      if(r.id.startsWith('mailto:'))window.location.href=r.id;
      else window.open(r.id,'_blank','noopener,noreferrer');
    } else onNavigate(r.action);
  }
  return <group>
    <Plastic size={[3.67,2.91,1.30]} position={[0,.86,-.58]} radius={.30} color="#bab399"/>
    <Plastic size={[4.25,3.47,.56]} position={[0,.79,.12]} radius={.22} color={cream}/>
    <Plastic size={[4.12,3.33,.12]} position={[0,.80,.449]} radius={.17} color={lightCream}/>
    <Plastic size={[3.79,2.90,.104]} position={[0,1.00,.525]} radius={.15} color="#697265"/>
    <Plastic size={[3.69,2.79,.033]} position={[0,1.00,.592]} radius={.13} color="#14221e"/>
    <mesh geometry={screenGeo} material={shader} position={[0,1.00,.622]}
      onPointerMove={move}
      onPointerOut={()=>{hovered.current=-1;redraw();document.body.style.cursor='auto';}}
      onPointerDown={click}
    />
    <Plastic size={[3.68,.015,.022]} position={[0,-.595,.478]} radius={.003} color="#a5a28c"/>
    <Plastic size={[.52,.055,.018]} position={[-1.44,-.76,.470]} radius={.014} color="#8b8c7a"/>
    <Plastic size={[.10,.10,.035]} position={[1.63,-.77,.487]} radius={.026} color="#979987" onClick={e=>{e.stopPropagation();onEffectsToggle?.();}}/>
    <mesh position={[1.40,-.76,.493]}><sphereGeometry args={[.027,16,16]}/><meshBasicMaterial color="#b9f69d"/></mesh>
    {[0,1,2,3].map(i=><Plastic key={i} size={[.08,.038,.019]} position={[.72+i*.16,-.77,.485]} radius={.012} color="#aaa48e"/>)}
    {Array.from({length:8}).map((_,i)=><mesh key={i} position={[1.87,1.50-i*.10,-.54]} rotation={[0,Math.PI/2,0]}>
      <boxGeometry args={[.55,.028,.012]}/><meshStandardMaterial color="#868675"/>
    </mesh>)}
    <Plastic size={[.85,.23,.66]} position={[0,-1.064,-.23]} radius={.09} color="#bfb79d"/>
    <Plastic size={[1.55,.145,1.12]} position={[0,-1.16,-.20]} radius={.09} color="#bcb398"/>
    <ComputerBase/>
  </group>;
}
function SceneContents(props){
  return <>
    <RetroRoom reducedMotion={props.reducedMotion}/>
    {/* The computer is rigidly placed in the world, never rotated by the cursor. */}
    <group rotation={[0,-.055,0]}>
      <Monitor {...props}/>
      <Keyboard/>
      <group position={[2.38,-1.48,2.48]} rotation={[0,-.15,0]}>
        <mesh castShadow scale={[.30,.16,.48]}>
          <sphereGeometry args={[1,24,16]}/>
          <meshStandardMaterial color="#dfdac5" roughness={.75}/>
        </mesh>
        <mesh position={[0,.142,-.17]} scale={[.025,.03,.095]}>
          <boxGeometry/><meshStandardMaterial color="#6d7167"/>
        </mesh>
      </group>
      <group position={[-2.92,-1.54,0]}>
        <Plastic size={[.68,.082,1.05]} position={[0,0,0]} radius={.02} color="#b8a98c"/>
        <Plastic size={[.51,.006,.71]} position={[0,.047,-.08]} radius={.002} color="#8ea6a0"/>
      </group>
    </group>
    <ContactShadows position={[0,-1.655,0]} opacity={.46} scale={10} blur={2.6} far={5} resolution={512} color="#18110d"/>
  </>;
}
function CameraMotion({zoom=0,reducedMotion=false}){
  const camera=useThree(state=>state.camera);
  const pointer=useThree(state=>state.pointer);
  const size=useThree(state=>state.size);
  const focus=useMemo(()=>new THREE.Vector3(),[]);
  const target=useMemo(()=>new THREE.Vector3(),[]);
  useFrame(({clock},delta)=>{
    const portrait=size.width/size.height < .82;
    camera.fov=portrait?53:37;
    camera.updateProjectionMatrix();
    const t=reducedMotion?0:clock.elapsedTime;
    // Gentle first-person parallax: the room moves relative to the fixed PC.
    const px=reducedMotion?0:pointer.x*.16;
    const py=reducedMotion?0:pointer.y*.105;
    const driftX=reducedMotion?0:Math.sin(t*.21)*.045;
    const driftY=reducedMotion?0:Math.cos(t*.17)*.030;
    const baseZ=portrait?(11.8-zoom*4.0):(9.45-zoom*3.15);
    target.set(px+driftX,1.28+py+driftY,baseZ);
    camera.position.lerp(target,1-Math.exp(-Math.min(.065,delta)*2.6));
    focus.set(px*.30,portrait?.38:.20+py*.16,0);
    camera.lookAt(focus);
  });
  return null;
}
export default function RetroComputer(props){
  return <Canvas className="retro-canvas" shadows dpr={[1,1.75]} camera={{position:[0,1.28,9.45],fov:37,near:.1,far:50}} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}}>
    <CameraMotion zoom={props.zoom} reducedMotion={props.reducedMotion}/><SceneContents {...props}/>
  </Canvas>;
}
