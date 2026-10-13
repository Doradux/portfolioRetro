import React, { Suspense, useEffect, useState } from 'react';
import {
  ArrowDown, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight,
  Boxes, Braces, Check, ChevronRight, Code2, ExternalLink, Gamepad2,
  Github, Images, Linkedin, Mail, Menu, Monitor, MousePointer2, RadioTower, ShieldCheck, X
} from 'lucide-react';
const RetroComputer = React.lazy(()=>import('./components/RetroComputer.jsx'));
import { projects, tech, experiences, education, socials, navItems, labProjects } from './lib/content.js';

const symbols = { hpr: Boxes, doradotv: RadioTower, albuvo: Images, draw: Gamepad2, scanner: ShieldCheck, cex: Braces };

function useWebGLSupport() {
  const [hasWebGL]=useState(()=>{
    if(typeof document==='undefined')return false;
    const c=document.createElement('canvas');
    try{return !!(c.getContext('webgl2')||c.getContext('webgl'));}
    catch{return false;}
  });
  return hasWebGL;
}

function ProjectCard({project,onClick}){
  const Icon=symbols[project.id]||Code2;
  return <button className="project-card" onClick={()=>onClick(project.id)} type="button">
    <div className="project-art" style={{'--art-color':project.hue}}>
      <span className="project-art-grid"/>
      <span className="project-art-glow"/>
      <div className="project-art-frame"><Icon size={66} strokeWidth={1.1}/></div>
      <span className="art-corner art-corner-tl">+</span><span className="art-corner art-corner-br">+</span>
      <span className="project-art-meta">PROJECT_{project.number} / {project.year}</span>
    </div>
    <div className="project-card-content">
      <div className="project-card-eyebrow"><span>{project.category}</span><span>{project.number} / 06</span></div>
      <div className="project-card-title-row"><h3>{project.title}</h3><ArrowUpRight size={25}/></div>
      <p>{project.description}</p>
      <div className="project-tags">{project.stack.slice(0,4).map(s=><span key={s}>{s}</span>)}</div>
    </div>
  </button>;
}

function ProjectDrawer({project,onClose}){
  useEffect(()=>{
    if(!project)return;
    const onKey=e=>{if(e.key==='Escape')onClose();};
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[project,onClose]);
  if(!project)return null;
  const Icon=symbols[project.id]||Code2;
  return <div className="drawer-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}} role="presentation">
    <section className="project-drawer" role="dialog" aria-modal="true" aria-label={project.title}>
      <div className="drawer-top"><span>PROJECT_ARCHIVE / {project.number}</span><button className="icon-button" type="button" onClick={onClose} aria-label="Cerrar"><X size={20}/></button></div>
      <div className="drawer-art" style={{'--art-color':project.hue}}><Icon size={110} strokeWidth={1}/><span>{project.category}</span></div>
      <span className="section-kicker">{project.label} • {project.year}</span>
      <h2>{project.title}</h2>
      <p>{project.detail}</p>
      <div className="drawer-tech"><span>STACK UTILIZADO</span><div>{project.stack.map(x=><span key={x}>{x}</span>)}</div></div>
      {project.link?<a href={project.link} target="_blank" rel="noreferrer" className="drawer-link">VER REPOSITORIO <ArrowUpRight size={19}/></a>:
        <div className="private-note"><Check size={17}/> Código privado o de uso interno. Sin acceso público.</div>}
    </section>
  </div>;
}

function App(){
  const [page,setPage]=useState('home');
  const [selected,setSelected]=useState(null);
  const [drawer,setDrawer]=useState(null);
  const [mobileOpen,setMobileOpen]=useState(false);
  const [zoomed,setZoomed]=useState(false);
  const [effects,setEffects]=useState(()=>typeof window==='undefined'?true:!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const hasWebGL=useWebGLSupport();
  function navigate(next){
    setPage(next);setSelected(null);setMobileOpen(false);
    const hero=document.getElementById('inicio');
    if(hero && window.scrollY>window.innerHeight*.7)hero.scrollIntoView({behavior:'smooth'});
  }
  function selectProject(id){
    setSelected(id);setPage('projects');setMobileOpen(false);
  }
  function openProject(id){
    selectProject(id);
    setDrawer(projects.find(p=>p.id===id)||null);
  }
  function closeDrawer(){setDrawer(null);}
  useEffect(()=>{const key=e=>{if(e.key==='Escape')setZoomed(false);};window.addEventListener('keydown',key);return ()=>window.removeEventListener('keydown',key);},[]);
  return <div className="site-shell">
    <div className="noise-layer" aria-hidden="true"/>
    <header className="header">
      <a className="brand" href="#inicio" onClick={()=>navigate('home')} aria-label="Marcos Dorado — Inicio">
        <span className="brand-symbol"><span>md</span><i/></span>
        <span className="brand-name">MARCOS DORADO<span className="brand-mini">/ DEV PORTFOLIO</span></span>
      </a>
      <nav className={'header-nav '+(mobileOpen?'menu-open':'')} aria-label="Navegación principal">
        <button type="button" onClick={()=>navigate('home')}>INICIO</button>
        <button type="button" onClick={()=>document.getElementById('trabajos').scrollIntoView({behavior:'smooth'})}>PROYECTOS</button>
        <button type="button" onClick={()=>document.getElementById('sobre-mi').scrollIntoView({behavior:'smooth'})}>SOBRE MÍ</button>
        <a href={socials.email} className="nav-contact">CONTACTAR <ArrowUpRight size={15}/></a>
      </nav>
      <button className="mobile-toggle" aria-label={mobileOpen?'Cerrar menú':'Abrir menú'} onClick={()=>setMobileOpen(!mobileOpen)}>{mobileOpen?<X/>:<Menu/>}</button>
    </header>

    <main>
      <section className="hero" id="inicio">
        <div className="hero-left">
          <div className="eyebrow"><span className="status-pulse"/><span>PORTFOLIO / EDICIÓN 2026</span><span className="eyebrow-line"/></div>
          <div className="hero-heading">
            <span className="heading-overline">HOLA, SOY</span>
            <h1>MARCOS<span className="name-last">DORADO<span className="accent-period">.</span></span></h1>
          </div>
          <p className="hero-role"><span className="terminal-caret">&gt;_</span> FULL STACK DEVELOPER</p>
          <p className="hero-desc">Diseño, desarrollo y conecto ideas.<br/>Del primer píxel al último endpoint.</p>
          <div className="hero-actions">
            <button className="btn btn-primary" type="button" onClick={()=>document.getElementById('trabajos').scrollIntoView({behavior:'smooth'})}>EXPLORAR PROYECTOS <ArrowUpRight size={19}/></button>
            <a className="btn btn-outline" href={socials.github} target="_blank" rel="noreferrer">MI GITHUB <Github size={18}/></a>
          </div>
          <div className="hero-metadata">
            <div><span className="meta-label">UBICACIÓN</span><span>SEVILLA, ESPAÑA <span className="meta-dot">↗</span></span></div>
            <div><span className="meta-label">EN QUÉ ANDO</span><span>CONSTRUYENDO COSAS <span className="tiny-led"/></span></div>
          </div>
        </div>
        <div className="hero-right">
          <div className="stage-glow" aria-hidden="true"/>
          <div className="stage-render">
            {hasWebGL&&!zoomed?<Suspense fallback={<div className="scene-loader">INICIANDO DORADO_OS <span>▋</span></div>}>
              <RetroComputer page={page} selectedProject={selected} onNavigate={navigate} onProject={selectProject} effects={effects}/>
            </Suspense>:<div className="scene-loader scene-error">WEBGL NO DISPONIBLE <p>Puedes navegar mediante los botones de la página.</p></div>}
          </div>
          <div className="stage-index"><span>FIG. 001 — PERSONAL WORKSTATION</span><span>EST. 1998 / REBUILT 2026</span></div>
          <div className="monitor-toolbar">
            <span className="toolbar-hint"><MousePointer2 size={14}/> PULSA EN LA PANTALLA PARA EXPLORAR</span>
            <button type="button" onClick={()=>setZoomed(true)} title="Ampliar monitor">AMPLIAR <ArrowUpRight size={15}/></button>
            <button type="button" onClick={()=>setEffects(e=>!e)} aria-pressed={effects} title="Alternar efectos CRT">
              <Monitor size={15}/> CRT FX: {effects?'ON':'OFF'}
            </button>
          </div>
          <div className="mini-nav" aria-label="Secciones del monitor">
            {navItems.map(item=><button key={item.id} type="button" className={page===item.id?'active':''} onClick={()=>navigate(item.id)}><span>{item.key}</span> {item.label}</button>)}
          </div>
        </div>
        <div className="hero-bottom"><span>DESLIZA PARA EXPLORAR</span><ArrowDown size={16}/><span className="hero-bottom-right">SCROLL TO DISCOVER <ArrowDownRight size={16}/></span></div>
      </section>

      <section className="work-section content-section" id="trabajos">
        <div className="section-heading-row">
          <div><span className="section-kicker"><span>01 /</span> TRABAJO SELECCIONADO</span><h2>Proyectos<span className="accent-period">.</span></h2></div>
          <p>Un poco de código, muchas ideas. Desde software de producción hasta experimentos que nacieron por curiosidad.</p>
        </div>
        <div className="project-grid">
          {projects.map(p=><ProjectCard key={p.id} project={p} onClick={openProject}/>)}
        </div>
        <div className="lab-section">
          <div className="lab-heading"><span className="section-kicker">ARCHIVO EXTRA / LAB_</span><h3>Y algunas cosas más <span>↗</span></h3></div>
          <div className="lab-grid">{labProjects.map((p,i)=>{
            const contents=<><span className="lab-index">0{i+1} / {p.type}</span><span className="lab-title">{p.title} <ArrowUpRight size={19}/></span><span className="lab-desc">{p.detail}</span></>;
            return p.href?<a className="lab-card" key={p.title} href={p.href} target="_blank" rel="noreferrer">{contents}</a>:<div className="lab-card lab-private" key={p.title}>{contents}<small>REPO PRIVADO</small></div>;
          })}</div>
        </div>
        <div className="section-foot"><span>06 / PIEZAS SELECCIONADAS</span><a href={socials.github} target="_blank" rel="noreferrer">MÁS EN GITHUB <ArrowUpRight size={17}/></a></div>
      </section>

      <section className="about-section content-section" id="sobre-mi">
        <div className="about-left">
          <span className="section-kicker"><span>02 /</span> DETRÁS DEL CÓDIGO</span>
          <h2>Curiosidad<br/>en modo <em>on.</em></h2>
          <p>Me llamo Marcos. Soy desarrollador full stack y me gusta entender cómo funcionan las cosas, desde la interfaz que ve el usuario hasta el servidor que la mantiene en pie.</p>
          <p>Actualmente desarrollo software de gestión para un entorno empresarial real. Fuera del trabajo sigo creando: aplicaciones colaborativas, plataformas multimedia, herramientas con IA y proyectos en tiempo real.</p>
          <div className="about-socials"><a href={socials.linkedin} target="_blank" rel="noreferrer"><Linkedin size={17}/> LINKEDIN <ArrowUpRight size={15}/></a><a href={socials.github} target="_blank" rel="noreferrer"><Github size={17}/> GITHUB <ArrowUpRight size={15}/></a></div>
        </div>
        <div className="about-right">
          <div className="terminal-header"><span><i/><i/><i/></span><span>marcos@dev ~ / about.txt</span><span>↗</span></div>
          <div className="terminal-body">
            <span className="term-line">$ cat experience.log</span>
            {experiences.map((exp,i)=><div className="timeline-row" key={i}><span className="timeline-dot"/><div><span className="timeline-date">{exp.period}</span><h3>{exp.role}</h3><strong>{exp.company}</strong><p>{exp.description}</p></div></div>)}
            <span className="term-line term-line-bottom">$ cat education.log</span>
            {education.map((ed,i)=><div className="education-row" key={i}><span>{ed.year}</span><div><strong>{ed.title}</strong><small>{ed.school}</small></div></div>)}
            <span className="term-ready">■ SYSTEM READY_</span>
          </div>
        </div>
      </section>

      <section className="skills-section content-section" id="stack">
        <div className="section-heading-row">
          <div><span className="section-kicker"><span>03 /</span> HERRAMIENTAS</span><h2>Mi stack<span className="accent-period">.</span></h2></div>
          <p>No se trata de coleccionar tecnologías, sino de elegir bien las herramientas para cada problema.</p>
        </div>
        <div className="skills-grid">{tech.map((group,i)=><div className="skill-panel" key={group.label}><div className="skill-panel-heading"><span>0{i+1}</span><h3>{group.label}</h3><Code2 size={18}/></div><div className="skill-tags">{group.items.map(item=><span key={item}>{item}</span>)}</div></div>)}</div>
      </section>

      <section className="contact-section content-section" id="contacto">
        <div className="contact-orbit" aria-hidden="true"><div className="orbit-one"/><div className="orbit-two"/><span>↗</span></div>
        <span className="section-kicker"><span>04 /</span> ESTABLECER CONEXIÓN</span>
        <h2>¿Hacemos<br/><em>que suceda?</em></h2>
        <p>Una idea, un reto técnico o un proyecto interesante.<br/>Mi bandeja de entrada está abierta.</p>
        <a href={socials.email} className="contact-big-link">HABLEMOS <ArrowUpRight size={30}/></a>
      </section>
    </main>
    <footer className="footer"><span>© 2026 MARCOS DORADO MUÑOZ</span><span>HECHO CON <span className="heart">♥</span> Y TRES DIMENSIONES</span><div><a href={socials.github} target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={18}/></a><a href={socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={18}/></a><a href={socials.email} aria-label="Email"><Mail size={18}/></a></div></footer>
    {zoomed&&<div className="zoom-overlay" role="dialog" aria-modal="true" aria-label="Monitor CRT ampliado">
      <div className="zoom-top"><span>▣ DORADO_OS / INTERACTIVE WORKSTATION</span><button type="button" onClick={()=>setZoomed(false)}><X size={17}/> CERRAR [ESC]</button></div>
      <div className="zoom-view"><Suspense fallback={<div className="scene-loader">INICIANDO MONITOR...</div>}><RetroComputer zoom page={page} selectedProject={selected} onNavigate={navigate} onProject={selectProject} effects={effects}/></Suspense></div>
      <div className="zoom-bottom"><span>HAZ CLIC EN LA PANTALLA PARA NAVEGAR</span><div>{navItems.map(item=><button type="button" key={item.id} className={page===item.id?'active':''} onClick={()=>navigate(item.id)}>{item.label}</button>)}</div><button type="button" onClick={()=>setEffects(e=>!e)}>CRT FX: {effects?'ON':'OFF'}</button></div>
    </div>}
    <ProjectDrawer project={drawer} onClose={closeDrawer}/>
  </div>;
}
export default App;
