import React, { Suspense, useCallback, useEffect, useState } from 'react';
import RetroComputer from './components/RetroComputer.jsx';
import { navItems, projects, socials, tech, experiences } from './lib/content.js';
import { filterProjects, PROJECTS_PER_PAGE } from './lib/screenPainter.js';
import './styles.css';
import { setAudioMuted } from './lib/retroAudio.js';

const shortcuts = { '1':'home', '2':'about', '3':'projects', '4':'skills', '5':'contact' };

function BrowserFallback({page,onNavigate}){
  return <div className="webgl-fallback">
    <div className="fallback-window">
      <div className="fallback-title">▣ DORADos <span>GRAPHICS DRIVER UNAVAILABLE</span></div>
      <nav aria-label="Portfolio sections">{navItems.map(n=>
        <button type="button" onClick={()=>onNavigate(n.id)} aria-current={page===n.id?'page':undefined} key={n.id}>
          {n.key} {n.label}
        </button>)}</nav>
      <div className="fallback-body">
        {page==='home'&&<><span>WELCOME.EXE</span><h1>Marcos Dorado</h1><p>Full stack developer · Seville, Spain. I build digital products from frontend to backend.</p></>}
        {page==='about'&&<><span>WHO_AM_I.TXT</span><h1>About me</h1><p>I am a full stack developer. I love solving real problems and turning ideas into products.</p>{experiences.map(e=><p key={e.company}><strong>{e.role} — {e.company}</strong><small>{e.description}</small></p>)}</>}
        {page==='projects'&&<><span>DIRECTORY.PROJECTS</span><h1>My projects</h1>{projects.map(p=><p key={p.id}><strong>{p.title}</strong><small>{p.description}</small>{p.link&&<a href={p.link} target="_blank" rel="noreferrer">View repository ↗</a>}</p>)}</>}
        {page==='skills'&&<><span>ENVIRONMENT.VARS</span><h1>Stack</h1>{tech.map(t=><p key={t.label}><strong>{t.label}</strong><small>{t.items.join(' · ')}</small></p>)}</>}
        {page==='contact'&&<><span>CONNECT.EXE</span><h1>Contact</h1><p>Shall we build something together?</p><a href={socials.email}>Send an email ↗</a><p><a href={socials.github} target="_blank" rel="noreferrer">GitHub ↗</a> · <a href={socials.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></p></>}
      </div>
    </div>
  </div>;
}
export default function App(){
  const [page,setPage]=useState('home');
  const [selectedProject,setSelectedProject]=useState(null);
  const [projectPage,setProjectPage]=useState(0);
  const [projectFilter,setProjectFilter]=useState('all');
  const [zoom,setZoom]=useState(0);
  const [muted,setMuted]=useState(()=>{
    try { return window.localStorage.getItem('dorados-muted')==='true'; }
    catch { return false; }
  });
  useEffect(()=>{setAudioMuted(muted);},[muted]);
  const toggleMute=useCallback(()=>{
    const next=!muted;
    setAudioMuted(next);
    setMuted(next);
    try { window.localStorage.setItem('dorados-muted',String(next)); } catch {}
  },[muted]);
  const [touchGap,setTouchGap]=useState(null);
  const [effects,setEffects]=useState(()=>!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [reducedMotion]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [hasWebGL]=useState(()=>{
    try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'));}
    catch{return false;}
  });
  const navigate=useCallback(next=>{
    if(next==='projects'&&page==='projects'&&selectedProject){setSelectedProject(null);return;}
    setPage(next);setSelectedProject(null);
  },[page,selectedProject]);
  const openProject=useCallback(id=>{setPage('projects');setSelectedProject(id);},[]);
  const turnProjectPage=useCallback(delta=>{
    const lastPage=Math.max(0,Math.ceil(filterProjects(projectFilter).length/PROJECTS_PER_PAGE)-1);
    setProjectPage(p=>Math.max(0,Math.min(lastPage,p+delta)));
  },[projectFilter]);
  const changeProjectFilter=useCallback(filter=>{
    setProjectFilter(filter);
    setProjectPage(0);
    setSelectedProject(null);
  },[]);
  useEffect(()=>{
    const onKey=e=>{
      if(e.metaKey||e.ctrlKey||e.altKey||['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;
      if(shortcuts[e.key]){e.preventDefault();navigate(shortcuts[e.key]);}
      if(e.key==='Escape')setSelectedProject(null);
      if(page==='projects'&&!selectedProject && (e.key==='ArrowLeft'||e.key==='ArrowRight')){
        e.preventDefault();
        if(!e.repeat)turnProjectPage(e.key==='ArrowRight'?1:-1);
      }
      if(e.key==='+'||e.key==='=')setZoom(z=>Math.min(1,z+.15));
      if(e.key==='-')setZoom(z=>Math.max(0,z-.15));
      if(e.key==='0')setZoom(0);
    };
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[navigate,page,selectedProject,turnProjectPage]);
  return <main className="immersive-portfolio" aria-label="Marcos Dorado 3D portfolio"
    onContextMenu={e=>e.preventDefault()}
    onWheel={e=>{if(hasWebGL)setZoom(z=>Math.max(0,Math.min(1,z+e.deltaY*.0008)));}}
    onTouchStart={e=>{if(e.touches.length===2){setTouchGap(Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY));}}}
    onTouchMove={e=>{if(e.touches.length===2&&touchGap!==null){
      const next=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      setZoom(z=>Math.max(0,Math.min(1,z+(next-touchGap)*.004)));
      setTouchGap(next);
    }}}
    onTouchEnd={e=>{if(e.touches.length<2)setTouchGap(null);}}>
    <button type="button" className="sound-toggle"
      onClick={toggleMute}
      onPointerDown={e=>e.stopPropagation()}
      onPointerUp={e=>e.stopPropagation()}
      onKeyDown={e=>e.stopPropagation()}
      onKeyUp={e=>e.stopPropagation()}
      aria-label={muted?'Unmute sounds':'Mute sounds'}
      aria-pressed={muted}
      title={muted?'Unmute sounds':'Mute sounds'}>
      <svg viewBox="0 0 24 24" width="21" height="21"
        aria-hidden="true" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 5 6 9H3v6h3l5 4V5Z"/>
        {muted?
          <><path d="m16 9 5 6M21 9l-5 6"/></>:
          <><path d="M15.5 8.5a5 5 0 0 1 0 7"/>
            <path d="M18.4 5.6a9 9 0 0 1 0 12.8"/></>}
      </svg>
    </button>
    {hasWebGL?
      <Suspense fallback={<div className="boot-screen"><span className="boot-cursor">▣</span> BOOTING DORADos...</div>}>
        <RetroComputer zoom={zoom} page={page} selectedProject={selectedProject}
          onNavigate={navigate} onProject={openProject}
          projectPage={projectPage} projectFilter={projectFilter}
          onProjectPage={turnProjectPage} onProjectFilter={changeProjectFilter}
          effects={effects} reducedMotion={reducedMotion}
          onEffectsToggle={()=>setEffects(v=>!v)}/>
      </Suspense>:
      <BrowserFallback page={page} onNavigate={navigate}/>
    }
    <div className="sr-only" role="note">
      Marcos Dorado interactive portfolio. All navigation is inside the computer screen.
      Press 1–5 to navigate, left/right arrows to turn project pages, Escape to go back, and use the mouse wheel to zoom.
    </div>
  </main>;
}
