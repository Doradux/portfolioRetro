import React, { Suspense, useCallback, useEffect, useState } from 'react';
import RetroComputer from './components/RetroComputer.jsx';
import { navItems, projects, socials, tech, experiences } from './lib/content.js';
import './styles.css';

const shortcuts = { '1':'home', '2':'about', '3':'projects', '4':'skills', '5':'contact' };

function BrowserFallback({page,onNavigate}){
  return <div className="webgl-fallback">
    <div className="fallback-window">
      <div className="fallback-title">▣ DORADO_OS <span>GRAPHICS DRIVER UNAVAILABLE</span></div>
      <nav aria-label="Secciones del portfolio">{navItems.map(n=>
        <button type="button" onClick={()=>onNavigate(n.id)} aria-current={page===n.id?'page':undefined} key={n.id}>
          {n.key} {n.label}
        </button>)}</nav>
      <div className="fallback-body">
        {page==='home'&&<><span>WELCOME.EXE</span><h1>Marcos Dorado</h1><p>Desarrollador full stack · Sevilla, España. Construyo productos digitales del frontend al backend.</p></>}
        {page==='about'&&<><span>WHO_AM_I.TXT</span><h1>Sobre mí</h1><p>Soy desarrollador de software full stack. Me gusta resolver problemas reales y convertir ideas en productos.</p>{experiences.map(e=><p key={e.company}><strong>{e.role} — {e.company}</strong><small>{e.description}</small></p>)}</>}
        {page==='projects'&&<><span>DIRECTORY.PROJECTS</span><h1>Mis proyectos</h1>{projects.map(p=><p key={p.id}><strong>{p.title}</strong><small>{p.description}</small>{p.link&&<a href={p.link} target="_blank" rel="noreferrer">Ver repositorio ↗</a>}</p>)}</>}
        {page==='skills'&&<><span>ENVIRONMENT.VARS</span><h1>Stack</h1>{tech.map(t=><p key={t.label}><strong>{t.label}</strong><small>{t.items.join(' · ')}</small></p>)}</>}
        {page==='contact'&&<><span>CONNECT.EXE</span><h1>Contacto</h1><p>¿Construimos algo juntos?</p><a href={socials.email}>Enviar email ↗</a><p><a href={socials.github} target="_blank" rel="noreferrer">GitHub ↗</a> · <a href={socials.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></p></>}
      </div>
    </div>
  </div>;
}
export default function App(){
  const [page,setPage]=useState('home');
  const [selectedProject,setSelectedProject]=useState(null);
  const [zoom,setZoom]=useState(0);
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
  useEffect(()=>{
    const onKey=e=>{
      if(e.metaKey||e.ctrlKey||e.altKey||['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;
      if(shortcuts[e.key]){e.preventDefault();navigate(shortcuts[e.key]);}
      if(e.key==='Escape')setSelectedProject(null);
      if(e.key.toLowerCase()==='f')setEffects(current=>!current);
      if(e.key==='+'||e.key==='=')setZoom(z=>Math.min(1,z+.15));
      if(e.key==='-')setZoom(z=>Math.max(0,z-.15));
      if(e.key==='0')setZoom(0);
    };
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[navigate]);
  return <main className="immersive-portfolio" aria-label="Portfolio 3D de Marcos Dorado"
    onWheel={e=>{if(hasWebGL)setZoom(z=>Math.max(0,Math.min(1,z+e.deltaY*.0008)));}}
    onTouchStart={e=>{if(e.touches.length===2){setTouchGap(Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY));}}}
    onTouchMove={e=>{if(e.touches.length===2&&touchGap!==null){
      const next=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      setZoom(z=>Math.max(0,Math.min(1,z+(next-touchGap)*.004)));
      setTouchGap(next);
    }}}
    onTouchEnd={e=>{if(e.touches.length<2)setTouchGap(null);}}>
    {hasWebGL?
      <Suspense fallback={<div className="boot-screen"><span className="boot-cursor">▣</span> INICIANDO DORADO_OS...</div>}>
        <RetroComputer zoom={zoom} page={page} selectedProject={selectedProject}
          onNavigate={navigate} onProject={openProject}
          effects={effects} reducedMotion={reducedMotion}
          onEffectsToggle={()=>setEffects(v=>!v)}/>
      </Suspense>:
      <BrowserFallback page={page} onNavigate={navigate}/>
    }
    <div className="sr-only" role="note">
      Portfolio interactivo de Marcos Dorado. La navegación está integrada en la pantalla del ordenador.
      También puedes utilizar las teclas 1 a 5 para navegar, Escape para volver, F para los efectos de monitor, y la rueda del ratón para acercarte o alejarte.
    </div>
  </main>;
}
