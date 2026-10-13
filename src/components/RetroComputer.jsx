import React, { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import RetroRoom from './RetroRoom.jsx';
import MobilePhone from './MobilePhone.jsx';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as THREE from 'three';
import { drawScreen, SW, SH } from '../lib/screenPainter.js';
import { screenRegionAtUv } from '../lib/screenHit.js';
import { KEY_LAYOUT } from '../lib/keyboardLayout.js';
import { preloadSounds, playKeyboard, playMouseDown, playMouseUp } from '../lib/retroAudio.js';
import { createMouseButtonTracker } from '../lib/mouseButtonTracker.js';
import {makeMouseCableCurve,makeMouseCableDynamics,updateMouseCableCurve} from '../lib/mouseCable.js';

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

function Keyboard(){
  const keys=useRef();
  const space=useRef();
  const dummy=useMemo(()=>new THREE.Object3D(),[]);
  const pressed=useRef(new Set());
  const heights=useRef(new Float32Array(KEY_LAYOUT.length));
  const spaceHeight=useRef(0);

  useEffect(()=>{
    const down=e=>{
      if(e.isComposing||e.repeat||pressed.current.has(e.code))return;
      pressed.current.add(e.code);
      playKeyboard(e.code);
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
    if(space.current)space.current.position.y=.193-spaceHeight.current;
  });

  return <group position={[-.23,-1.49,2.38]} rotation={[.10,-.02,0]}>
    {/* Front lip touches the desk; low-profile rear feet support the raised edge. */}
    {[-1.67,1.77].map((x,i)=><Plastic key={'foot-'+i} size={[.30,.125,.22]}
      position={[x,-.170,-.53]} radius={.035} color="#777568"/>)}
    <Plastic size={[4.17,.22,1.36]} position={[.13,0,.05]} radius={.11} color={lightCream}/>
    <Plastic size={[4.04,.05,1.18]} position={[.12,.122,.03]} radius={.04} color="#b4af98"/>
    <instancedMesh ref={keys} args={[undefined,undefined,KEY_LAYOUT.length]} castShadow receiveShadow>
      <boxGeometry args={[.164,.092,.153]}/>
      <meshStandardMaterial color="#eae5d2" roughness={.9}/>
    </instancedMesh>
    <Plastic ref={space} size={[.93,.091,.16]} position={[-.23,.193,.473]} radius={.03} color="#c1baa5"/>
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

const DESK_SURFACE_Y=-1.665;
// Angle the mouse nose inward, toward the computer (left), not outward.
const MOUSE_INWARD_YAW=.24;
const MOUSE_BOUNDARIES={minX:2.37,maxX:3.03,minZ:2.15,maxZ:2.89};

const CABLE_SEGMENTS=40;
function MouseAndShadow(){
  const {pointer}=useThree();
  const mouse=useRef();
  const shade=useRef();
  const leftButton=useRef();
  const rightButton=useRef();
  const cable=useRef();
  const tracker=useRef(null);
  if(!tracker.current) {
    tracker.current=createMouseButtonTracker(playMouseDown,playMouseUp);
  }
  const pressed=tracker.current.pressed;
  const dummy=useMemo(()=>new THREE.Object3D(),[]);
  const previous=useMemo(()=>new THREE.Vector3(),[]);
  const next=useMemo(()=>new THREE.Vector3(),[]);
  const tangent=useMemo(()=>new THREE.Vector3(),[]);
  const axis=useMemo(()=>new THREE.Vector3(0,1,0),[]);
  const curve=useMemo(()=>makeMouseCableCurve(),[]);
  const cableDynamics=useMemo(()=>makeMouseCableDynamics(),[]);
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
    const listener=tracker.current;
    const down=e=>listener.onMouseDown(e);
    const up=e=>listener.onMouseUp(e);
    const move=e=>listener.onMouseMove(e);
    const reset=()=>listener.reset();
    const lost=e=>{if(!e.relatedTarget)reset();};
    const visibility=()=>{if(document.hidden)reset();};
    window.addEventListener('mousedown',down);
    window.addEventListener('mouseup',up);
    window.addEventListener('mousemove',move);
    window.addEventListener('mouseout',lost);
    window.addEventListener('blur',reset);
    document.addEventListener('visibilitychange',visibility);
    return ()=>{
      window.removeEventListener('mousedown',down);
      window.removeEventListener('mouseup',up);
      window.removeEventListener('mousemove',move);
      window.removeEventListener('mouseout',lost);
      window.removeEventListener('blur',reset);
      document.removeEventListener('visibilitychange',visibility);
      reset();
    };
  },[]);
  useFrame((_,dt)=>{
    if(!mouse.current||!shade.current||!leftButton.current||!rightButton.current||!cable.current)return;
    const targetX=THREE.MathUtils.clamp(2.70+pointer.x*.34,MOUSE_BOUNDARIES.minX,MOUSE_BOUNDARIES.maxX);
    const targetZ=THREE.MathUtils.clamp(2.50-pointer.y*.36,MOUSE_BOUNDARIES.minZ,MOUSE_BOUNDARIES.maxZ);
    const ease=1-Math.exp(-Math.min(dt,.07)*13.5);
    mouse.current.position.x=THREE.MathUtils.lerp(mouse.current.position.x,targetX,ease);
    mouse.current.position.z=THREE.MathUtils.lerp(mouse.current.position.z,targetZ,ease);
    shade.current.position.x=mouse.current.position.x;
    shade.current.position.z=mouse.current.position.z;
    // Each button moves independently. The housing remains stationary.
    leftButton.current.position.y=THREE.MathUtils.lerp(
      leftButton.current.position.y,.121-(pressed.has(0)?.032:0),ease);
    rightButton.current.position.y=THREE.MathUtils.lerp(
      rightButton.current.position.y,.121-(pressed.has(2)?.032:0),ease);

    // Give the cable's first two bends independent spring inertia so it
    // softly trails the hand instead of behaving like a rigid mouse antenna.
    // The outer stretch still clears the side of the PC.
    updateMouseCableCurve(curve,mouse.current.position.x,mouse.current.position.z,
      MOUSE_INWARD_YAW,cableDynamics,dt);
    curve.getPoint(0,previous);
    for(let i=0;i<CABLE_SEGMENTS;i++){
      curve.getPoint((i+1)/CABLE_SEGMENTS,next);
      dummy.position.copy(previous).add(next).multiplyScalar(.5);
      dummy.quaternion.setFromUnitVectors(axis,tangent.subVectors(next,previous).normalize());
      dummy.scale.set(1,previous.distanceTo(next)+.009,1);
      dummy.updateMatrix();
      cable.current.setMatrixAt(i,dummy.matrix);
      previous.copy(next);
    }
    cable.current.instanceMatrix.needsUpdate=true;
  });
  return <group>
    <mesh ref={shade} position={[2.70,-1.660,2.50]} rotation={[-Math.PI/2,0,MOUSE_INWARD_YAW]} renderOrder={1}>
      <planeGeometry args={[.95,1.27]}/>
      <meshBasicMaterial map={texture} transparent depthWrite={false} opacity={.38} polygonOffset polygonOffsetFactor={-2}/>
    </mesh>
    <instancedMesh ref={cable} args={[undefined,undefined,CABLE_SEGMENTS]} castShadow>
      <cylinderGeometry args={[.013,.013,1,7]}/>
      <meshStandardMaterial color="#31332c" roughness={.95}/>
    </instancedMesh>
    <group ref={mouse} position={[2.70,-1.5675,2.50]} rotation={[0,MOUSE_INWARD_YAW,0]}>
      {/* Squarish 90s mouse shell with gently rounded rectangular corners. */}
      <Plastic size={[.60,.195,.86]} position={[0,0,0]} radius={.072} color="#ddd4b9"/>
      <Plastic size={[.565,.065,.52]} position={[0,.051,.116]} radius={.042} color="#c9bfa6"/>
      <Plastic ref={leftButton} size={[.253,.042,.30]} position={[-.142,.121,-.215]} radius={.027} color="#f1ead5"/>
      <Plastic ref={rightButton} size={[.253,.042,.30]} position={[.142,.121,-.215]} radius={.027} color="#eae2ca"/>
      <mesh position={[0,.135,-.212]} rotation={[0,0,Math.PI/2]}>
        <cylinderGeometry args={[.033,.033,.062,18]}/>
        <meshStandardMaterial color="#676e67" roughness={.67}/>
      </mesh>
      <mesh position={[0,.159,-.22]}>
        <boxGeometry args={[.010,.005,.074]}/>
        <meshStandardMaterial color="#3e453e" roughness={.9}/>
      </mesh>
      <mesh position={[0,.055,-.421]}>
        <cylinderGeometry args={[.052,.052,.061,16]}/>
        <meshStandardMaterial color="#ada58c" roughness={.85}/>
      </mesh>
    </group>
  </group>;
}
function ComputerBase(){
  return <group position={[0,-1.45,-.22]}>
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
function Monitor({page,selectedProject,onNavigate,onProject,projectPage,projectFilter,onProjectPage,onProjectFilter,effects,onEffectsToggle}){
  const canvas=useMemo(()=>{const c=document.createElement('canvas');c.width=SW;c.height=SH;return c;},[]);
  const texture=useMemo(()=>{const t=new THREE.CanvasTexture(canvas);t.anisotropy=8;t.colorSpace=THREE.SRGBColorSpace;return t;},[canvas]);
  const regions=useRef([]), hovered=useRef(-1);
  // Keep the actual screen-space pointer position across CRT content updates.
  // Changing pages does not fire another pointermove when the cursor is still.
  const pointerUv=useRef(null);
  const shader=useMemo(()=>new THREE.ShaderMaterial({
    uniforms:{uMap:{value:texture},uTime:{value:0},uEffects:{value:1}},
    vertexShader,fragmentShader,side:THREE.FrontSide,toneMapped:false
  }),[texture]);
  const screenGeo=useMemo(()=>{
    const geo=new THREE.PlaneGeometry(3.54,2.65,48,48),p=geo.attributes.position;
    for(let i=0;i<p.count;i++){const x=p.getX(i)/1.77,y=p.getY(i)/1.325;p.setZ(i,.10*(1-x*x)*(1-y*y));}
    geo.computeVertexNormals();return geo;
  },[]);
  function redraw(){
    // First reconstruct the current page's interactive regions, then resolve
    // hover using the last real pointer position (not an outdated region index).
    const currentRegions=drawScreen(canvas,page,selectedProject,-1,projectPage,projectFilter);
    const idx=screenRegionAtUv(currentRegions,pointerUv.current,SW,SH,effects,shader.uniforms.uTime.value);
    hovered.current=idx;
    if(idx>=0)drawScreen(canvas,page,selectedProject,idx,projectPage,projectFilter);
    regions.current=currentRegions;
    texture.needsUpdate=true;
    document.body.style.cursor=idx>=0?'pointer':'auto';
  }
  useEffect(()=>{
    redraw();
    let active=true;
    // Ignore stale async font callbacks from a page that has since changed.
    document.fonts.ready.then(()=>{if(active)redraw();});
    return ()=>{active=false;};
  },[page,selectedProject,projectPage,projectFilter,canvas,texture,effects]);
  useEffect(()=>()=>{shader.dispose();texture.dispose();screenGeo.dispose();document.body.style.cursor='auto';},[shader,texture,screenGeo]);
  useFrame(({clock})=>{shader.uniforms.uTime.value=clock.elapsedTime;shader.uniforms.uEffects.value=effects?1:0;});
  function move(e){
    e.stopPropagation();
    pointerUv.current=e.uv?{x:e.uv.x,y:e.uv.y}:null;
    const idx=screenRegionAtUv(regions.current,pointerUv.current,SW,SH,effects,shader.uniforms.uTime.value);
    if(idx!==hovered.current)redraw();
  }
  function click(e){
    if(e.button!==0)return;
    e.stopPropagation();
    pointerUv.current=e.uv?{x:e.uv.x,y:e.uv.y}:null;
    const idx=screenRegionAtUv(regions.current,pointerUv.current,SW,SH,effects,shader.uniforms.uTime.value);
    if(idx<0)return;
    const r=regions.current[idx];
    if(r.action==='project')onProject(r.id);
    else if(r.action==='project-page')onProjectPage(r.id);
    else if(r.action==='project-filter')onProjectFilter(r.id);
    else if(r.action==='external'){
      if(r.id.startsWith('mailto:'))window.location.href=r.id;
      else window.open(r.id,'_blank','noopener,noreferrer');
    } else onNavigate(r.action);
  }
  function leave(){
    pointerUv.current=null;
    if(hovered.current!==-1)redraw();
    else document.body.style.cursor='auto';
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
      onPointerOut={leave}
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
  useEffect(()=>{void preloadSounds();},[]);
  return <>
    <RetroRoom reducedMotion={props.reducedMotion}/>
    {/* The computer is rigidly placed in the world, never rotated by the cursor. */}
    <group rotation={[0,-.055,0]}>
      {!props.isMobile && <Monitor {...props}/>}
      {!props.isMobile && <Keyboard/>}
      {!props.isMobile && <MouseAndShadow/>}
      <MobilePhone {...props}/>
    </group>
    <ContactShadows position={[0,-1.655,0]} opacity={.17} scale={8} blur={1.8} far={2.3} frames={1} resolution={256} color="#18110d"/>
  </>;
}
function CameraMotion({zoom=0,reducedMotion=false,isMobile=false}){
  const {camera,pointer,size}=useThree();
  const target=useMemo(()=>new THREE.Vector3(),[]);
  const smoothLook=useMemo(()=>new THREE.Vector3(0,.24,0),[]);
  const currentFov=useRef(null);

  useFrame(({clock},delta)=>{
    const fov=isMobile?68:37;
    if(currentFov.current!==fov){
      camera.fov=fov;
      camera.updateProjectionMatrix();
      currentFov.current=fov;
    }

    if(isMobile){
      // Almost top-down: the camera's image plane is nearly parallel to
      // the tabletop and remains stable while using the phone's D-pad.
      // The short distance makes the phone larger; the FOV retains a margin
      // around the full body in both portrait and landscape orientations.
      camera.position.set(-3.24,.94,.66);
      camera.lookAt(-3.24,-1.54,.45);
      return;
    }
    const z=9.45-zoom*3.15;
    // Raise the eye and the focal point as we approach the CRT, keeping
    // the complete top frame visible even with the zoom at its maximum.
    camera.position.set(0,1.28+zoom*.37,z);

    // A single, frame-rate-independent smoothing pass avoids the previous
    // accumulated delay from target lerp + quaternion slerp.
    const yaw=reducedMotion?0:pointer.x*.024;
    const pitch=reducedMotion?0:pointer.y*.014;
    const t=reducedMotion?0:clock.elapsedTime;
    const driftX=reducedMotion?0:Math.sin(t*.22)*.00065;
    const driftY=reducedMotion?0:Math.cos(t*.18)*.00048;
    target.set((yaw+driftX)*z,.24+zoom*.62+(pitch+driftY)*z,0);

    const response=1-Math.exp(-Math.min(delta,.075)*11.5);
    smoothLook.lerp(target,response);
    camera.lookAt(smoothLook);
  });
  return null;
}
export default function RetroComputer(props){
  return <Canvas className="retro-canvas" frameloop="always" shadows dpr={[1,1.45]} camera={{position:[0,1.28,9.45],fov:37,near:.1,far:50}} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}}>
    <CameraMotion zoom={props.zoom} reducedMotion={props.reducedMotion} isMobile={props.isMobile}/><SceneContents {...props}/>
  </Canvas>;
}
