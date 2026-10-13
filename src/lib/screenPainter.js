import { projects, tech, experiences, education, navItems, socials } from './content.js';

export const SW = 1200;
export const SH = 900;

const C = {
  bg: '#0b1719',
  panel: '#112628',
  panel2: '#193133',
  line: '#345052',
  text: '#e8f3db',
  muted: '#88a8a1',
  lime: '#c6ee90',
  orange: '#ebc48e',
  blue: '#99d4dc'
};

function rr(ctx,x,y,w,h,r,fill,stroke) {
  ctx.beginPath(); ctx.roundRect(x,y,w,h,r);
  if(fill){ctx.fillStyle=fill;ctx.fill();}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.4;ctx.stroke();}
}
function tx(ctx,s,x,y,size=24,color=C.text,font='DM Sans',weight=500) {
  ctx.fillStyle=color; ctx.font=weight+' '+size+'px "'+font+'"'; ctx.fillText(s,x,y);
}
function mono(ctx,s,x,y,size=19,color=C.muted,weight=400) {
  tx(ctx,s,x,y,size,color,'Space Mono',weight);
}
function line(ctx,x,y,w,color=C.line) {
  ctx.fillStyle=color;ctx.fillRect(x,y,w,1.2);
}
function wrap(ctx,str,x,y,maxWidth,lh=36,maxLines=5) {
  const words=str.split(' ');let lineText='',n=0;
  for (let i=0;i<words.length;i++) {
    const test=lineText+words[i]+' ';
    if(ctx.measureText(test).width>maxWidth && lineText) {
      ctx.fillText(lineText,x,y+n*lh);n++;lineText=words[i]+' ';
      if(n>=maxLines)return;
    } else lineText=test;
  }
  if(lineText&&n<maxLines)ctx.fillText(lineText,x,y+n*lh);
}
function button(ctx,regions,txtLabel,x,y,w,h,action,kind='primary',id=null) {
  const primary=kind==='primary';
  rr(ctx,x,y,w,h,11,primary?C.lime:'#192c2d',primary?null:'#446463');
  mono(ctx,txtLabel,x+22,y+h/2+7,18,primary?'#152b27':C.text,700);
  mono(ctx,'↗',x+w-34,y+h/2+7,22,primary?'#152b27':C.lime);
  regions.push({x,y,w,h,action,id});
}
function badge(ctx,label,x,y,color=C.lime){
  const w=ctx.measureText(label).width+33;
  rr(ctx,x,y-21,w,32,5,'#1b3532');
  mono(ctx,label,x+16,y,14,color,700);
}
function mainHeader(ctx,kicker,heading,subtitle){
  mono(ctx,kicker,316,178,17,C.lime,700);
  tx(ctx,heading,313,249,61,C.text,'DM Sans',800);
  if(subtitle)tx(ctx,subtitle,316,292,23,C.muted);
}
function titleSmall(ctx,n,title,x,y,w=360){
  mono(ctx,n,x,y,16,C.lime,700);
  tx(ctx,title,x,y+41,27,C.text,'DM Sans',700);
  line(ctx,x,y+58,w);
}
function drawHome(ctx,regions){
  mono(ctx,'01 / WELCOME.EXE',316,193,18,C.lime,700);
  tx(ctx,'HOLA, SOY',311,309,83,C.text,'DM Sans',800);
  tx(ctx,'MARCOS',311,409,106,C.lime,'DM Sans',800);
  tx(ctx,'DORADO.',310,503,95,C.text,'DM Sans',800);
  mono(ctx,'FULL STACK DEVELOPER // SEVILLA, ESPAÑA',316,561,20,C.orange,700);
  tx(ctx,'Construyo productos digitales de principio a fin.',316,613,26,C.text);
  tx(ctx,'Frontend, backend, sistemas y mucha curiosidad.',316,652,25,C.muted);
  button(ctx,regions,'VER PROYECTOS',316,706,280,60,'projects');
  button(ctx,regions,'SOBRE MÍ',615,706,210,60,'about','secondary');
  rr(ctx,903,695,201,72,9,C.panel,'#45635d');
  mono(ctx,'STATUS:',922,723,15,C.muted);
  mono(ctx,'● AVAILABLE',922,752,17,C.lime,700);

  rr(ctx,912,173,207,289,12,'#132c2d','#395a54');
  mono(ctx,'// SYSTEM.LOG',931,210,16,C.lime);
  line(ctx,930,227,168);
  ['> initialize()', '> create()', '> improve()', '> ship()'].forEach((s,i)=>mono(ctx,s,933,277+i*40,17,i===3?C.lime:C.muted));
  mono(ctx,'[ READY ]',935,431,16,C.orange,700);
}
function drawAbout(ctx,regions){
  mainHeader(ctx,'02 / WHO_AM_I.TXT','Más que código.','Programador por profesión. Creador por curiosidad.');
  rr(ctx,315,320,807,181,12,C.panel,'#395754');
  ctx.font='500 26px "DM Sans"';ctx.fillStyle=C.text;
  wrap(ctx,'Soy Marcos, desarrollador de software full stack. Disfruto transformando problemas reales en productos que las personas puedan usar: desde aplicaciones empresariales hasta proyectos multimedia, juegos y herramientas de inteligencia artificial.',342,365,747,36,5);
  titleSmall(ctx,'>','EXPERIENCIA',318,545,370);
  experiences.forEach((e,i)=>{
    const y=640+i*93;
    mono(ctx,e.period,320,y,15,C.lime);
    tx(ctx,e.role,520,y,23,C.text,'DM Sans',700);
    mono(ctx,e.company.toUpperCase(),520,y+29,15,C.muted);
  });
  button(ctx,regions,'CONTACTAR',819,787,293,51,'contact','secondary');
}
function drawProjects(ctx,regions,selected){
  mainHeader(ctx,'03 / DIRECTORY.PROJECTS','Proyectos','Una selección de lo que he construido.');
  if(selected){
    const p=projects.find(x=>x.id===selected);
    if(p){
      mono(ctx,'← VOLVER AL DIRECTORIO',317,338,18,C.lime,700);
      regions.push({x:311,y:306,w:360,h:49,action:'projects',id:'back'});
      rr(ctx,315,381,805,345,12,C.panel,'#4a5c55');
      mono(ctx,p.number+' / '+p.category,341,426,17,C.lime);
      tx(ctx,p.title,337,503,54,C.text,'DM Sans',800);
      ctx.font='500 25px "DM Sans"';ctx.fillStyle=C.text;
      wrap(ctx,p.detail,341,558,748,35,4);
      mono(ctx,p.stack.join(' · '),343,686,15,C.orange);
      if(p.link){button(ctx,regions,'VER EN GITHUB',317,750,298,59,'external','primary',p.link);}
      else mono(ctx,'PROYECTO PRIVADO / CÓDIGO NO PÚBLICO',320,789,18,C.muted);
      return;
    }
  }
  projects.forEach((p,i)=>{
    const col=i%2,row=Math.floor(i/2),x=317+col*408,y=321+row*166,w=387,h=150;
    rr(ctx,x,y,w,h,9,C.panel,'#36514e');
    ctx.fillStyle=p.hue;ctx.fillRect(x+15,y+16,3,115);
    mono(ctx,p.number+'  /  '+p.category,x+30,y+43,14,C.lime);
    tx(ctx,p.title.length>22?p.title.slice(0,23):p.title,x+28,y+90,p.title.length>20?24:31,C.text,'DM Sans',700);
    mono(ctx,p.stack.slice(0,3).join(' · '),x+30,y+121,13,C.muted);
    mono(ctx,'↗',x+w-41,y+42,27,C.lime,700);
    regions.push({x,y,w,h,action:'project',id:p.id});
  });
}
function drawSkills(ctx){
  mainHeader(ctx,'04 / ENVIRONMENT.VARS','Mi toolkit','Tecnologías que utilizo para construir, probar y desplegar.');
  tech.forEach((category,i)=>{
    const col=i%2,row=Math.floor(i/2),x=314+col*414,y=333+row*248,w=391,h=231;
    rr(ctx,x,y,w,h,11,C.panel,'#395754');
    mono(ctx,'0'+(i+1)+'   '+category.label,x+21,y+40,18,C.lime,700);
    line(ctx,x+21,y+60,w-42);
    category.items.forEach((item,n)=>{
      const colItem=n%2,rowItem=Math.floor(n/2);
      const px=x+20+colItem*187,py=y+82+rowItem*36;
      rr(ctx,px,py,173,30,5,'#1b3837');
      mono(ctx,item,px+9,py+21,item.length>13?12:14,C.text);
    });
  });
}
function drawContact(ctx,regions){
  mainHeader(ctx,'05 / CONNECT.EXE','Hablemos.','¿Tienes una idea, un proyecto o simplemente quieres saludar?');
  rr(ctx,313,332,807,192,12,C.panel,'#49615b');
  tx(ctx,'¿CONSTRUIMOS ALGO',339,415,45,C.text,'DM Sans',800);
  tx(ctx,'JUNTOS?',338,470,58,C.lime,'DM Sans',800);
  button(ctx,regions,'ENVIAR UN EMAIL',315,570,807,68,'external','primary',socials.email);
  button(ctx,regions,'VISITAR GITHUB',315,663,392,65,'external','secondary',socials.github);
  button(ctx,regions,'VER LINKEDIN',731,663,390,65,'external','secondary',socials.linkedin);
  mono(ctx,'MAR COS DORADO / FULL STACK DEVELOPER / SEVILLA',320,787,16,C.muted);
}
export function drawScreen(canvas,page,selected,hovered){
  const ctx=canvas.getContext('2d');
  const regions=[];
  ctx.clearRect(0,0,SW,SH);
  const bg=ctx.createLinearGradient(0,0,SW,SH);
  bg.addColorStop(0,'#0d2425');bg.addColorStop(.65,C.bg);bg.addColorStop(1,'#142727');
  ctx.fillStyle=bg;ctx.fillRect(0,0,SW,SH);
  // faint software grid, intentionally below the CRT shader
  ctx.strokeStyle='rgba(176,220,163,.045)';ctx.lineWidth=1;
  for(let x=0;x<SW;x+=42){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,SH);ctx.stroke();}
  for(let y=0;y<SH;y+=42){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(SW,y);ctx.stroke();}
  ctx.fillStyle='#142c2c';ctx.fillRect(0,0,SW,84);
  line(ctx,0,84,SW,'#3c5751');
  rr(ctx,28,20,47,45,8,C.lime);
  mono(ctx,'MD',36,50,20,'#172b28',700);
  mono(ctx,'DORADO_OS',96,49,22,C.text,700);
  mono(ctx,'v.26.10',331,49,16,C.muted);
  mono(ctx,'●  ONLINE',992,50,17,C.lime,700);
  ctx.fillStyle='#122526';ctx.fillRect(0,86,268,814);
  line(ctx,268,86,1,'#3c5751');
  mono(ctx,'/ROOT/DORADO',35,157,18,C.lime,700);
  mono(ctx,'EXPLORER',35,199,14,C.muted);
  navItems.forEach((item,i)=>{
    const y=235+i*79,active=item.id===page;
    rr(ctx,22,y,228,59,7,active?'#2c4a43':'#162b2a',active?'#708c69':null);
    if(active){ctx.fillStyle=C.lime;ctx.fillRect(23,y+12,4,35);}
    mono(ctx,item.key,36,y+37,16,active?C.lime:C.muted);
    mono(ctx,item.label,77,y+37,16,active?C.text:C.muted,active?700:400);
    regions.push({x:22,y,w:228,h:59,action:item.id});
  });
  line(ctx,31,713,206);
  mono(ctx,'MEMORY  64K OK',36,751,14,C.muted);
  mono(ctx,'OS BUILD  2026',36,782,14,C.muted);
  rr(ctx,32,816,202,39,6,'#1a3a32');
  mono(ctx,'● ALL SYSTEMS GO',42,841,13,C.lime,700);

  if(page==='about')drawAbout(ctx,regions);
  else if(page==='projects')drawProjects(ctx,regions,selected);
  else if(page==='skills')drawSkills(ctx);
  else if(page==='contact')drawContact(ctx,regions);
  else drawHome(ctx,regions);

  ctx.fillStyle='#132827';ctx.fillRect(268,848,932,52);
  line(ctx,268,848,932,'#3d5851');
  mono(ctx,'> marcos@dorado:~$ '+(page==='home'?'whoami':page),313,883,16,C.lime);
  mono(ctx,'© 2026',1055,883,15,C.muted);
  if(hovered>=0 && regions[hovered]){
    const r=regions[hovered];
    rr(ctx,r.x,r.y,r.w,r.h,6,'rgba(200,237,155,.075)','rgba(200,237,155,.47)');
  }
  return regions;
}
