import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import RetroRoom from './RetroRoom.jsx';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as THREE from 'three';
import { drawScreen, SW, SH } from '../lib/screenPainter.js';

const vertexShader = "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}";
const fragmentShader = "\nuniform sampler2D uMap;\nuniform float uTime;\nuniform float uEffects;\nvarying vec2 vUv;\nfloat rnd(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}\nvoid main(){\n vec2 c=vUv*2.0-1.0;\n vec2 uv=vUv+c*dot(c,c)*.029*uEffects;\n float roll=fract(uTime*.061);\n float seamDist=abs(fract(uv.y-roll+.5)-.5);\n float band=exp(-pow(seamDist*24.,2.));\n uv.x+=(.0014*sin(uv.y*21.5-uTime*1.37)+.0008*sin(uv.y*59.+uTime*.65)+.0030*band)*uEffects;\n float rgb=.00145*uEffects;\n vec3 color=vec3(texture2D(uMap,uv+vec2(rgb,0.)).r,texture2D(uMap,uv).g,texture2D(uMap,uv-vec2(rgb,0.)).b);\n float scan=1.-.065*(.5+.5*cos(uv.y*900.*3.14159));\n color*=mix(1.,scan*(.97+.03*sin(uv.x*1200.*3.14159)),uEffects);\n color+=(rnd(floor(uv*vec2(1200.,900.))+floor(uTime*24.))-.5)*.013*uEffects;\n color+=vec3(.018,.039,.022)*band*uEffects;\n color*=1.-.26*pow(clamp(length(c)/1.42,0.,1.),1.7);\n float refl=pow(max(0.,1.-length((vUv-vec2(.12,.94))*vec2(.75,1.3))),7.);\n color+=vec3(.035,.055,.055)*refl;\n color*=step(.003,uv.x)*step(.003,uv.y)*step(uv.x,.997)*step(uv.y,.997);\n gl_FragColor=vec4(color,1.0);\n #include <tonemapping_fragment>\n #include <colorspace_fragment>\n}\n";
// Periodic distance wraps the rolling interference band across the top/bottom
// UV seam: it fades out of one edge and enters smoothly at the other.
const cream = '#cdc5a9';
const lightCream = '#e2dcc6';

function Plastic({size,position,rotation=[0,0,0],radius=.10,color=cream,children,...rest}){
  const geometry=useMemo(()=>new RoundedBoxGeometry(size[0],size[1],size[2],4,radius),[...size,radius]);
  return <mesh geometry={geometry} position={position} rotation={rotation} castShadow receiveShadow {...rest}>
    <meshStandardMaterial color={color} roughness={.82} metalness={.02}/>{children}
  </mesh>;
}

// Physical rows match the modeled keycaps. Browser KeyboardEvent.code keeps
// the correct key active independently of keyboard language/layout.
const KEY_ROWS = [
  ['Escape','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','PrintScreen','Delete'],
  ['Backquote','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0','Minus','Equal','Backspace','Insert'],
  ['Tab','KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP','BracketLeft','BracketRight','Backslash','Home'],
  ['CapsLock','KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon','Quote','Enter','End','PageUp'],
  ['ShiftLeft','KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma','Period','Slash','ShiftRight','ArrowUp','PageDown','ContextMenu'],
  ['ControlLeft','MetaLeft','AltLeft','IntlBackslash','Fn',null,null,null,null,null,'AltRight','MetaRight','ControlRight','ArrowLeft','ArrowRight']
];
const NUMPAD_ROWS=[
  ['NumLock','NumpadDivide','NumpadMultiply','NumpadSubtract'],
  ['Numpad7','Numpad8','Numpad9','NumpadAdd'],
  ['Numpad4','Numpad5','Numpad6','NumpadAdd'],
  ['Numpad1','Numpad2','Numpad3','NumpadEnter'],
  ['Numpad0','NumpadDecimal','ArrowDown','NumpadEnter']
];
const KEY_LAYOUT = [
  ...KEY_ROWS.flatMap((row,r)=>row.flatMap((code,c)=>code? [{
    code, x:-1.58+c*.194, z:-.44+r*.176, scale:[.94,1,.91]
  }]:[])),
  ...NUMPAD_ROWS.flatMap((row,r)=>row.map((code,c)=>({
    code,x:1.49+c*.172,z:-.40+r*.177,scale:[.88,1,.91]
  })))
];
function Keyboard(){
  const keys=useRef();
  const space=useRef();
  const dummy=useMemo(()=>new THREE.Object3D(),[]);
  const pressed=useRef(new Set());
  const heights=useRef(new Float32Array(KEY_LAYOUT.length));
  const spaceHeight=useRef(0);
  const lastFrame=useRef(0);

  useEffect(()=>{
    const down=e=>{
      if(e.isComposing)return;
      pressed.current.add(e.code);
    };
    const up=e=>pressed.current.delete(e.code);
    const reset=()=>pressed.current.clear();
    window.addEventListener('keydown',down);
    window.addEventListener('keyup',up);
    window.addEventListener('blur',reset);
    document.addEventListener('visibilitychange',reset);
    return ()=>{
      window.removeEventListener('keydown',down);
      window.removeEventListener('keyup',up);
      window.removeEventListener('blur',reset);
      document.removeEventListener('visibilitychange',reset);
    };
  },[]);

  useLayoutEffect(()=>{
    KEY_LAYOUT.forEach((key,i)=>{
      dummy.position.set(key.x,.204,key.z);
      dummy.scale.set(...key.scale);
      dummy.updateMatrix();
      keys.current.setMatrixAt(i,dummy.matrix);
    });
    keys.current.instanceMatrix.needsUpdate=true;
  },[dummy]);

  useFrame((_,dt)=>{
    // Active keys animate with a crisp 45 ms depression and a slightly slower
    // rebound; the other caps keep their matrices unchanged.
    let changed=false;
    const easing=1-Math.exp(-Math.min(dt,.08)*24);
    const active=pressed.current;
    KEY_LAYOUT.forEach((key,i)=>{
      const target=active.has(key.code)?.060:0;
      const next=THREE.MathUtils.lerp(heights.current[i],target,easing);
      const settled=Math.abs(next-target)<.0005?target:next;
      if(Math.abs(settled-heights.current[i])<.00015)return;
      heights.current[i]=settled;
      dummy.position.set(key.x,.204-settled,key.z);
      dummy.scale.set(...key.scale);
      dummy.updateMatrix();
      keys.current.setMatrixAt(i,dummy.matrix);
      changed=true;
    });
    if(changed)keys.current.instanceMatrix.needsUpdate=true;

    const target=active.has('Space')?.060:0;
    const next=THREE.MathUtils.lerp(spaceHeight.current,target,easing);
    spaceHeight.current=Math.abs(next-target)<.0005?target:next;
    if(space.current)space.current.position.y=.235-spaceHeight.current;
  });

  return <group position={[-.23,-1.49,2.38]} rotation={[-.10,-.02,0]}>
    <Plastic size={[4.17,.22,1.36]} position={[.13,0,.05]} radius={.11} color={lightCream}/>
    <Plastic size={[4.04,.05,1.18]} position={[.12,.122,.03]} radius={.04} color="#b4af98"/>
    <instancedMesh ref={keys} args={[undefined,undefined,KEY_LAYOUT.length]} castShadow receiveShadow>
      <boxGeometry args={[.164,.092,.153]}/>
      <meshStandardMaterial color="#eae5d2" roughness={.9}/>
    </instancedMesh>
    <Plastic ref={space} size={[.93,.091,.16]} position={[-.23,.235,.473]} radius={.03} color="#c1baa5"/>
  </group>;
}

function RoundedOutline({outerWidth,outerHeight,innerWidth,innerHeight,depth=.08,outerRadius=.19,innerRadius=.12,color='#d1c7ab',z=.52}){
  const geo=useMemo(()=>{
    const shape=new THREE.Shape();
    const rounded=(path,left,bottom,width,height,r,clockwise=false)=>{
      if(!clockwise){
        path.moveTo(left+r,bottom);path.lineTo(left+width-r,bottom);
        path.quadraticCurveTo(left+width,bottom,left+width,bottom+r);
        path.lineTo(left+width,bottom+height-r);
        path.quadraticCurveTo(left+width,bottom+height,left+width-r,bottom+height);
        path.lineTo(left+r,bottom+height);
        path.quadraticCurveTo(left,bottom+height,left,bottom+height-r);
        path.lineTo(left,bottom+r);
        path.quadraticCurveTo(left,bottom,left+r,bottom);
      }else{
        path.moveTo(left+r,bottom);
        path.quadraticCurveTo(left,bottom,left,bottom+r);
        path.lineTo(left,bottom+height-r);
        path.quadraticCurveTo(left,bottom+height,left+r,bottom+height);
        path.lineTo(left+width-r,bottom+height);
        path.quadraticCurveTo(left+width,bottom+height,left+width,bottom+height-r);
        path.lineTo(left+width,bottom+r);
        path.quadraticCurveTo(left+width,bottom,left+width-r,bottom);
        path.lineTo(left+r,bottom);
      }
    };
    rounded(shape,-outerWidth/2,-outerHeight/2,outerWidth,outerHeight,outerRadius);
    const hole=new THREE.Path();
    rounded(hole,-innerWidth/2,-innerHeight/2,innerWidth,innerHeight,innerRadius,true);
    shape.holes.push(hole);
    const g=new THREE.ExtrudeGeometry(shape,{
      depth,steps:1,curveSegments:12,
      bevelEnabled:true,bevelThickness:.023,bevelSize:.019,bevelSegments:4
    });
    g.computeVertexNormals();
    return g;
  },[outerWidth,outerHeight,innerWidth,innerHeight,depth,outerRadius,innerRadius]);
  useEffect(()=>()=>geo.dispose(),[geo]);
  return <mesh geometry={geo} position={[0,1.00,z]} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={.68} metalness={.035}/>
  </mesh>;
}

const MOUSE_BOUNDARIES={minX:2.37,maxX:3.03,minZ:2.15,maxZ:2.89};

function MouseAndShadow(){
  const {pointer}=useThree();
  const mouse=useRef();
  const shade=useRef();
  const click=useRef(-1);
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
    const ctx=canvas.getContext('2d');
    const grad=ctx.createRadialGradient(64,64,5,64,64,62);
    grad.addColorStop(0,'rgba(16,11,7,.45)');
    grad.addColorStop(.45,'rgba(16,11,7,.27)');
    grad.addColorStop(1,'rgba(16,11,7,0)');
    ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);
    return new THREE.CanvasTexture(canvas);
  },[]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  useEffect(()=>{
    const down=e=>{if(e.button===0||e.button===2)click.current=e.button;};
    const up=e=>{if(e.button===click.current)click.current=-1;};
    const reset=()=>{click.current=-1;};
    window.addEventListener('pointerdown',down);
    window.addEventListener('pointerup',up);
    window.addEventListener('pointercancel',reset);
    window.addEventListener('blur',reset);
    return ()=>{
      window.removeEventListener('pointerdown',down);
      window.removeEventListener('pointerup',up);
      window.removeEventListener('pointercancel',reset);
      window.removeEventListener('blur',reset);
    };
  },[]);
  useFrame((_,dt)=>{
    if(!mouse.current||!shade.current)return;
    // Tracking the cursor does not hide, replace or lock the real browser pointer.
    // Clamping ensures the physical mouse cannot escape the tabletop.
    const targetX=THREE.MathUtils.clamp(2.70+pointer.x*.34,MOUSE_BOUNDARIES.minX,MOUSE_BOUNDARIES.maxX);
    const targetZ=THREE.MathUtils.clamp(2.50-pointer.y*.36,MOUSE_BOUNDARIES.minZ,MOUSE_BOUNDARIES.maxZ);
    const ease=1-Math.exp(-Math.min(dt,.07)*13.5);
    const destY=-1.49+(click.current===-1?0:-.015);
    mouse.current.position.x=THREE.MathUtils.lerp(mouse.current.position.x,targetX,ease);
    mouse.current.position.z=THREE.MathUtils.lerp(mouse.current.position.z,targetZ,ease);
    mouse.current.position.y=THREE.MathUtils.lerp(mouse.current.position.y,destY,ease);
    mouse.current.rotation.z=THREE.MathUtils.lerp(mouse.current.rotation.z,-.15+(click.current===0?.035:click.current===2?-.035:0),ease);
    shade.current.position.x=mouse.current.position.x;
    shade.current.position.z=mouse.current.position.z;
  });
  return <group>
    {/* Shadow follows the physical mouse without clipping through the desk. */}
    <mesh ref={shade} position={[2.70,-1.657,2.50]} rotation={[-Math.PI/2,0,-.15]} renderOrder={1}>
      <planeGeometry args={[.90,1.25]}/>
      <meshBasicMaterial map={texture} transparent depthWrite={false} opacity={.7} polygonOffset polygonOffsetFactor={-2}/>
    </mesh>
    <group ref={mouse} position={[2.70,-1.49,2.50]} rotation={[0,-.15,0]}>
      <mesh scale={[.30,.16,.48]} castShadow>
        <sphereGeometry args={[1,36,24]}/>
        <meshStandardMaterial color="#dfdac5" roughness={.76}/>
      </mesh>
      <mesh position={[0,.154,-.16]} rotation={[-.09,0,0]}>
        <boxGeometry args={[.013,.012,.19]}/>
        <meshStandardMaterial color="#888a79" roughness={.85}/>
      </mesh>
      <mesh position={[0,.158,-.14]} rotation={[-Math.PI/2,0,0]}>
        <cylinderGeometry args={[.025,.025,.065,14]}/>
        <meshStandardMaterial color="#6f7369" roughness={.66}/>
      </mesh>
    </group>
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
    <Plastic size={[3.76,2.85,.08]} position={[0,1.00,.510]} radius={.13} color="#17241f"/>
    {/* Individually bevelled, continuous rounded CRT surround. */}
    <RoundedOutline outerWidth={3.94} outerHeight={3.04}
      innerWidth={3.58} innerHeight={2.68}
      outerRadius={.23} innerRadius={.16} color="#cbc2a9" z={.505}/>
    <RoundedOutline outerWidth={3.80} outerHeight={2.90}
      innerWidth={3.56} innerHeight={2.66}
      outerRadius={.17} innerRadius={.13} color="#8d9585" z={.538}/>
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
      <MouseAndShadow/>
      <group position={[-2.92,-1.54,0]}>
        <Plastic size={[.68,.082,1.05]} position={[0,0,0]} radius={.02} color="#b8a98c"/>
        <Plastic size={[.51,.006,.71]} position={[0,.047,-.08]} radius={.002} color="#8ea6a0"/>
      </group>
    </group>
    <ContactShadows position={[0,-1.655,0]} opacity={.25} scale={9} blur={2.35} far={3} frames={1} resolution={256} color="#18110d"/>
  </>;
}
function CameraMotion({zoom=0,reducedMotion=false}){
  const {camera,pointer,size}=useThree();
  const target=useMemo(()=>new THREE.Vector3(),[]);
  const smoothLook=useMemo(()=>new THREE.Vector3(0,.24,0),[]);
  const currentFov=useRef(null);

  useFrame(({clock},delta)=>{
    const portrait=size.width/size.height<.82;
    const fov=portrait?53:37;
    if(currentFov.current!==fov){
      camera.fov=fov;
      camera.updateProjectionMatrix();
      currentFov.current=fov;
    }

    const z=portrait?11.8-zoom*4:9.45-zoom*3.15;
    camera.position.set(0,1.28,z);

    // A single, frame-rate-independent smoothing pass avoids the previous
    // accumulated delay from target lerp + quaternion slerp.
    const yaw=reducedMotion?0:pointer.x*.024;
    const pitch=reducedMotion?0:pointer.y*.014;
    const t=reducedMotion?0:clock.elapsedTime;
    const driftX=reducedMotion?0:Math.sin(t*.22)*.00065;
    const driftY=reducedMotion?0:Math.cos(t*.18)*.00048;
    target.set((yaw+driftX)*z,.24+(pitch+driftY)*z,0);

    const response=1-Math.exp(-Math.min(delta,.075)*11.5);
    smoothLook.lerp(target,response);
    camera.lookAt(smoothLook);
  });
  return null;
}
export default function RetroComputer(props){
  return <Canvas className="retro-canvas" frameloop="always" shadows dpr={[1,1.45]} camera={{position:[0,1.28,9.45],fov:37,near:.1,far:50}} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}}>
    <CameraMotion zoom={props.zoom} reducedMotion={props.reducedMotion}/><SceneContents {...props}/>
  </Canvas>;
}
