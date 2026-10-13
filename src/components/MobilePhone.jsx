import React,{useCallback,useEffect,useMemo,useRef,useState} from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {paintPhoneScreen,PHONE_SCREEN_WIDTH,PHONE_SCREEN_HEIGHT} from '../lib/phonePainter.js';
import {initialPhoneFocus,updatePhoneFocus} from '../lib/phoneNavigation.js';
import {playKeyboard} from '../lib/retroAudio.js';

const LCD_Z=-.43;
function Shell({size,position,radius=.04,color,children,...events}){
  const geometry=useMemo(()=>new RoundedBoxGeometry(...size,4,radius),[...size,radius]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  return <mesh geometry={geometry} position={position} castShadow receiveShadow {...events}>
    <meshStandardMaterial color={color} roughness={.79} metalness={.025}/>
    {children}
  </mesh>;
}
const controls=[
  {id:'up',x:0,z:.48},
  {id:'down',x:0,z:.98},
  {id:'left',x:-.29,z:.73},
  {id:'right',x:.29,z:.73},
  {id:'ok',x:0,z:.73},
  {id:'back',x:-.48,z:1.22},
  {id:'menu',x:.48,z:1.22}
];
// Render hardware symbols with explicit vector paths, never with Unicode
// glyphs that iOS/Android can substitute with colored emoji.
function drawKeySymbol(ctx,id){
  ctx.save();
  ctx.translate(64,64);
  ctx.fillStyle=id==='ok'?'#edf8d9':'#324b3b';
  ctx.strokeStyle='#324b3b';
  ctx.lineJoin='round';ctx.lineCap='round';
  if(['up','down','left','right'].includes(id)){
    const turns={up:0,right:Math.PI/2,down:Math.PI,left:-Math.PI/2};
    ctx.rotate(turns[id]);
    ctx.beginPath();ctx.moveTo(0,-31);ctx.lineTo(29,20);ctx.lineTo(-29,20);
    ctx.closePath();ctx.fill();
  }else if(id==='back'){
    ctx.lineWidth=9;
    ctx.beginPath();ctx.moveTo(-28,7);ctx.bezierCurveTo(-20,-28,23,-28,29,5);
    ctx.stroke();
    ctx.beginPath();ctx.moveTo(-35,-5);ctx.lineTo(-17,-19);ctx.lineTo(-14,8);
    ctx.closePath();ctx.fill();
  }else if(id==='menu'){
    ctx.lineWidth=10;
    for(const y of [-23,0,23]){
      ctx.beginPath();ctx.moveTo(-31,y);ctx.lineTo(31,y);ctx.stroke();
    }
  }else{
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='700 47px Arial,sans-serif';
    ctx.fillText('OK',0,3);
  }
  ctx.restore();
}
const keyMap={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',
  Enter:'ok',' ':'ok',Escape:'back',Backspace:'back',m:'menu',M:'menu'};
function PhoneKey({item,active,onActivate,onRelease}){
  const labelCanvas=useMemo(()=>{
    const c=document.createElement('canvas');c.width=128;c.height=128;
    const ctx=c.getContext('2d');ctx.clearRect(0,0,128,128);
    drawKeySymbol(ctx,item.id);
    return c;
  },[item.id]);
  const texture=useMemo(()=>new THREE.CanvasTexture(labelCanvas),[labelCanvas]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  const color=item.id==='ok'?'#3f775e':item.id==='menu'?'#b4b68e':item.id==='back'?'#d7bc93':'#e6e1cd';
  const size=item.id==='ok'?[.245,.068,.245]:['back','menu'].includes(item.id)?[.235,.06,.15]:[.258,.06,.226];
  return <group position={[item.x,0,item.z]}>
    <Shell size={size} position={[0,active?.103:.137,0]} radius={.035}
      color={color}
      onPointerDown={e=>{e.stopPropagation();onActivate(item.id);}}
      onPointerUp={e=>{e.stopPropagation();onRelease(item.id);}}
      onPointerOut={()=>onRelease(item.id)}
      onClick={e=>e.stopPropagation()}/>
    <mesh position={[0,active?.139:.174,0]} rotation={[-Math.PI/2,0,0]}
      onPointerDown={e=>{e.stopPropagation();onActivate(item.id);}}
      onPointerUp={e=>{e.stopPropagation();onRelease(item.id);}}
      onPointerOut={()=>onRelease(item.id)}>
      <planeGeometry args={[size[0]*.76,size[2]*.72]}/>
      <meshBasicMaterial map={texture} transparent depthWrite={false}/>
    </mesh>
  </group>;
}
export default function MobilePhone({isMobile=false,page='home',selectedProject=null,onNavigate,onProject}){
  const [focus,setFocus]=useState(()=>initialPhoneFocus(page));
  const focusRef=useRef(focus);
  const [activeKey,setActiveKey]=useState(null);
  const canvas=useMemo(()=>{
    const c=document.createElement('canvas');
    c.width=PHONE_SCREEN_WIDTH;c.height=PHONE_SCREEN_HEIGHT;
    return c;
  },[]);
  const texture=useMemo(()=>{
    const t=new THREE.CanvasTexture(canvas);
    t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;
    return t;
  },[canvas]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  useEffect(()=>{
    paintPhoneScreen(canvas,{page,selectedProject,focus});
    texture.needsUpdate=true;
    let active=true;
    document.fonts.ready.then(()=>{
      if(active){paintPhoneScreen(canvas,{page,selectedProject,focus});texture.needsUpdate=true;}
    });
    return ()=>{active=false;};
  },[canvas,texture,page,selectedProject,focus]);
  const activate=useCallback(action=>{
    if(!isMobile)return;
    const {state,command}=updatePhoneFocus(focusRef.current,action,{page,selectedProject});
    focusRef.current=state;setFocus(state);
    playKeyboard('Phone'+action);
    if(command?.kind==='navigate')onNavigate(command.page);
    if(command?.kind==='project')onProject(command.id);
    if(command?.kind==='external'){
      if(command.url.startsWith('mailto:'))window.location.href=command.url;
      else if(command.url.startsWith('https://'))window.open(command.url,'_blank','noopener,noreferrer');
    }
  },[isMobile,page,selectedProject,onNavigate,onProject]);
  useEffect(()=>{
    if(!isMobile)return;
    const down=e=>{
      if(e.repeat||e.altKey||e.ctrlKey||e.metaKey)return;
      const action=keyMap[e.key];
      if(!action)return;
      e.preventDefault();activate(action);setActiveKey(action);
    };
    const up=e=>{const action=keyMap[e.key];if(action)setActiveKey(v=>v===action?null:v);};
    const reset=()=>setActiveKey(null);
    window.addEventListener('keydown',down);
    window.addEventListener('keyup',up);
    window.addEventListener('blur',reset);
    return ()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',reset);};
  },[isMobile,activate]);
  const hit=useCallback(action=>{activate(action);setActiveKey(action);},[activate]);
  const release=useCallback(action=>setActiveKey(v=>v===action?null:v),[]);
  return <group
    position={isMobile?[-3.22,-1.575,.45]:[-2.92,-1.623,0]}
    rotation={[0,isMobile?.055:-.07,0]}
    scale={isMobile?[.90,1,1]:[.46,.46,.46]}>
    {/* All LCD bezel layers share x=0,z=-.43, keeping the glass centered. */}
    <Shell size={[1.49,.18,2.80]} radius={.105} position={[0,0,0]} color="#aead99"/>
    <Shell size={[1.41,.035,2.69]} radius={.083} position={[0,.092,0]} color="#d8d4ba"/>
    <Shell size={[1.305,.041,1.53]} position={[0,.112,LCD_Z]} radius={.058} color="#39493f"/>
    <Shell size={[1.248,.014,1.465]} position={[0,.138,LCD_Z]} radius={.031} color="#879e83"/>
    <mesh position={[0,.147,LCD_Z]} rotation={[-Math.PI/2,0,0]}>
      <planeGeometry args={[1.202,1.426]}/>
      <meshBasicMaterial map={texture} color="#bdd1b7" toneMapped={false} side={THREE.DoubleSide}/>
    </mesh>
    <Shell size={[.46,.014,.042]} position={[0,.127,-1.275]}
      radius={.010} color="#656e5d"/>
    <Shell size={[.16,.013,.035]} position={[.49,.123,-1.265]}
      radius={.008} color="#8eb696"/>
    {controls.map(item=><PhoneKey key={item.id} item={item}
      active={isMobile&&activeKey===item.id}
      onActivate={hit} onRelease={release}/>)}
    <Shell size={[.36,.017,.022]} position={[0,.12,1.355]}
      radius={.009} color="#757768"/>
  </group>;
}
