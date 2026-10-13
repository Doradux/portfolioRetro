import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
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
function Monitor({page,selectedProject,onNavigate,onProject,effects}){
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
    <Plastic size={[.10,.10,.035]} position={[1.63,-.77,.487]} radius={.026} color="#979987" onClick={e=>{e.stopPropagation();onNavigate('home');}}/>
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
  const pc=useRef(), {pointer}=useThree();
  useFrame((_,dt)=>{
    if(!pc.current)return;
    const factor=1-Math.exp(-dt*2.3);
    pc.current.rotation.y=THREE.MathUtils.lerp(pc.current.rotation.y,-.11+pointer.x*.065,factor);
    pc.current.rotation.x=THREE.MathUtils.lerp(pc.current.rotation.x,-.02-pointer.y*.019,factor);
  });
  return <>
    <color attach="background" args={['#161f20']}/>
    <fog attach="fog" args={['#161f20',11,22]}/>
    <ambientLight intensity={2.35}/>
    <hemisphereLight args={['#f5e6c4','#40574c',2]}/>
    <directionalLight position={[-3.8,6.5,5]} intensity={3.4} color="#fff0d5" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7}/>
    <pointLight position={[3.3,1.3,-3]} color="#84e3ba" intensity={30} distance={11}/>
    <pointLight position={[-4,1.3,2]} color="#ffb47d" intensity={12} distance={10}/>
    <mesh position={[0,-1.68,0]} receiveShadow rotation={[-Math.PI/2,0,0]}>
      <planeGeometry args={[200,200]}/><meshStandardMaterial color="#262c29" roughness={.93}/>
    </mesh>
    <group ref={pc}>
      <Monitor {...props}/>
      <Keyboard/>
      <group position={[2.38,-1.48,2.48]} rotation={[0,-.15,0]}>
        <mesh castShadow scale={[.30,.16,.48]}><sphereGeometry args={[1,24,16]}/><meshStandardMaterial color="#dfdac5" roughness={.75}/></mesh>
        <mesh position={[0,.142,-.17]} scale={[.025,.03,.095]}><boxGeometry/><meshStandardMaterial color="#6d7167"/></mesh>
      </group>
      <group position={[-2.92,-1.54,.0]}>
        <Plastic size={[.68,.082,1.05]} position={[0,0,0]} radius={.02} color="#b8a98c"/>
        <Plastic size={[.51,.006,.71]} position={[0,.047,-.08]} radius={.002} color="#8ea6a0"/>
      </group>
    </group>
    <ContactShadows position={[0,-1.66,0]} opacity={.5} scale={11} blur={2.4} far={5} resolution={256} color="#080e0b"/>
  </>;
}
function CameraAim({zoom}){
  const camera=useThree(state=>state.camera);
  useEffect(()=>{
    camera.lookAt(0,zoom?.72:0,0);
    camera.updateProjectionMatrix();
  },[camera,zoom]);
  return null;
}
export default function RetroComputer(props){
  return <Canvas className="retro-canvas" shadows dpr={[1,1.75]} camera={{position:props.zoom?[0,1.17,6.35]:[0,1.17,8.4],fov:37,near:.1,far:50}} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}}>
    <CameraAim zoom={props.zoom}/><SceneContents {...props}/>
  </Canvas>;
}
