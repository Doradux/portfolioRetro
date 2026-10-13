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
  tx(ctx,'HELLO, I\'M',311,309,83,C.text,'DM Sans',800);
  tx(ctx,'MARCOS',311,409,106,C.lime,'DM Sans',800);
  tx(ctx,'DORADO.',310,503,95,C.text,'DM Sans',800);
  mono(ctx,'FULL STACK DEVELOPER // SEVILLE, SPAIN',316,561,20,C.orange,700);
  tx(ctx,'I build digital products, end to end.',316,613,26,C.text);
  tx(ctx,'Frontend, backend, systems and curiosity.',316,652,25,C.muted);
  button(ctx,regions,'MY PROJECTS',316,706,280,60,'projects');
  button(ctx,regions,'ABOUT ME',615,706,210,60,'about','secondary');
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
  mainHeader(ctx,'02 / WHO_AM_I.TXT','Beyond code.','A developer by trade. A maker by nature.');
  rr(ctx,315,320,807,181,12,C.panel,'#395754');
  ctx.font='500 26px "DM Sans"';ctx.fillStyle=C.text;
  wrap(ctx,'I am Marcos, a full stack software developer. I enjoy turning real problems into useful digital products, from business applications to multimedia platforms, games and artificial intelligence tools.',342,365,747,36,5);
  titleSmall(ctx,'>','EXPERIENCE',318,545,370);
  experiences.forEach((e,i)=>{
    const y=640+i*93;
    mono(ctx,e.period,320,y,15,C.lime);
    tx(ctx,e.role,520,y,23,C.text,'DM Sans',700);
    mono(ctx,e.company.toUpperCase(),520,y+29,15,C.muted);
  });
  button(ctx,regions,'GET IN TOUCH',819,787,293,51,'contact','secondary');
}
export const PROJECTS_PER_PAGE=6;
export function filterProjects(filter='all'){
  return projects.filter(p=>filter==='all' || (filter==='other'
    ? p.visibility==='local'||p.visibility==='professional'
    : p.visibility===filter));
}
function shrinkText(ctx,label,maxWidth,size,minSize=17,font='DM Sans',weight=700){
  let s=size;
  while(s>minSize){
    ctx.font=weight+' '+s+'px "'+font+'"';
    if(ctx.measureText(label).width<=maxWidth)break;
    s--;
  }
  let result=label;
  while(ctx.measureText(result).width>maxWidth&&result.length>3)result=result.slice(0,-2)+'…';
  return {size:s,text:result};
}
function drawProjects(ctx,regions,selected,projectPage=0,projectFilter='all'){
  mainHeader(ctx,'03 / DIRECTORY.PROJECTS','Projects',projects.length+' projects / public + private archives');
  if(selected){
    const p=projects.find(x=>x.id===selected);
    if(!p)return;
    mono(ctx,'← BACK TO DIRECTORY',317,332,18,C.lime,700);
    regions.push({x:313,y:306,w:375,h:44,action:'projects',id:'back'});
    rr(ctx,315,370,805,356,12,C.panel,'#4a5c55');
    mono(ctx,p.number+' / '+p.category,341,413,17,C.lime);
    mono(ctx,p.label+'  ·  '+p.year,341,442,14,C.orange);
    const headline=shrinkText(ctx,p.title,751,50,24);
    tx(ctx,headline.text,339,505,headline.size,C.text,'DM Sans',800);
    ctx.font='500 24px "DM Sans"';ctx.fillStyle=C.text;
    wrap(ctx,p.detail||p.description,342,550,740,33,4);
    mono(ctx,'TECH / '+p.stack.join('  ·  ').slice(0,95),341,696,15,C.muted);
    if(p.link){
      button(ctx,regions,'OPEN GITHUB REPO',317,745,322,62,'external','primary',p.link);
    } else {
      rr(ctx,317,746,596,59,8,'#1b3835','#3b514d');
      mono(ctx,p.visibility==='private'?'PRIVATE REPOSITORY  ·  SOURCE NOT PUBLIC':
          p.visibility==='professional'?'PROPRIETARY WORK  ·  CODE CONFIDENTIAL':
          'LOCAL PROJECT  ·  YOU ARE HERE',336,783,16,C.lime);
    }
    mono(ctx,'REPOSITORY / '+(p.repo||'N/A').slice(0,40),318,833,14,C.muted);
    return;
  }

  const filters=[
    ['all','ALL',projects.length],
    ['public','PUBLIC',filterProjects('public').length],
    ['private','PRIVATE',filterProjects('private').length],
    ['other','OTHER',filterProjects('other').length]
  ];
  filters.forEach(([value,label,count],i)=>{
    const x=316+i*163,y=308,w=153,h=34,active=value===projectFilter;
    rr(ctx,x,y,w,h,6,active?'#bfe89c':'#172f30',active?null:'#385655');
    mono(ctx,label+' '+count,x+12,y+23,15,active?'#173126':C.muted,active?700:400);
    regions.push({x,y,w,h,action:'project-filter',id:value});
  });
  const visible=filterProjects(projectFilter);
  const pageCount=Math.max(1,Math.ceil(visible.length/PROJECTS_PER_PAGE));
  const safePage=Math.max(0,Math.min(pageCount-1,projectPage));
  visible.slice(safePage*PROJECTS_PER_PAGE,(safePage+1)*PROJECTS_PER_PAGE).forEach((p,i)=>{
    const col=i%2,row=Math.floor(i/2),x=317+col*408,y=354+row*145,w=387,h=132;
    rr(ctx,x,y,w,h,9,C.panel,'#36514e');
    ctx.fillStyle=p.hue;ctx.fillRect(x+15,y+13,3,105);
    mono(ctx,p.number+' / '+(p.visibility==='public'?'PUBLIC':p.visibility==='private'?'PRIVATE':'EXTRA'),x+29,y+29,13,C.lime,700);
    const headline=shrinkText(ctx,p.title,316,30,19);
    tx(ctx,headline.text,x+29,y+76,headline.size,C.text,'DM Sans',700);
    const stack=p.stack.slice(0,3).join(' · ');
    const tags=shrinkText(ctx,stack,318,14,11,'Space Mono',400);
    mono(ctx,tags.text,x+29,y+107,tags.size,C.muted);
    mono(ctx,'↗',x+w-39,y+31,23,C.lime,700);
    regions.push({x,y,w,h,action:'project',id:p.id});
  });

  const left=316,bottomY=799,arrowH=37;
  const prevEnabled=safePage>0,nextEnabled=safePage<pageCount-1;
  rr(ctx,left,bottomY,116,arrowH,6,'#1b3431',prevEnabled?'#638472':'#2c4240');
  mono(ctx,'← PREV',left+18,bottomY+24,15,prevEnabled?C.lime:'#4f6561',700);
  if(prevEnabled)regions.push({x:left,y:bottomY,w:116,h:arrowH,action:'project-page',id:-1});
  rr(ctx,left+132,bottomY,116,arrowH,6,'#1b3431',nextEnabled?'#638472':'#2c4240');
  mono(ctx,'NEXT →',left+145,bottomY+24,15,nextEnabled?C.lime:'#4f6561',700);
  if(nextEnabled)regions.push({x:left+132,y:bottomY,w:116,h:arrowH,action:'project-page',id:1});
  mono(ctx,'PAGE '+(safePage+1)+' / '+pageCount+'    ·    '+visible.length+' PROJECTS',762,bottomY+25,15,C.muted,700);
}
function drawSkills(ctx){
  mainHeader(ctx,'04 / ENVIRONMENT.VARS','My toolkit','Tools I use to build, test and ship software.');
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
  mainHeader(ctx,'05 / CONNECT.EXE','Let\'s talk.','An idea, a project, or just want to say hello?');
  rr(ctx,313,332,807,192,12,C.panel,'#49615b');
  tx(ctx,'LET\'S BUILD',339,415,45,C.text,'DM Sans',800);
  tx(ctx,'SOMETHING.',338,470,58,C.lime,'DM Sans',800);
  button(ctx,regions,'SEND AN EMAIL',315,570,807,68,'external','primary',socials.email);
  button(ctx,regions,'VISIT GITHUB',315,663,392,65,'external','secondary',socials.github);
  button(ctx,regions,'VIEW LINKEDIN',731,663,390,65,'external','secondary',socials.linkedin);
  mono(ctx,'MARCOS DORADO / FULL STACK DEVELOPER / SEVILLE',320,787,16,C.muted);
}
export function drawScreen(canvas,page,selected,hovered,projectPage=0,projectFilter="all"){
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
  else if(page==='projects')drawProjects(ctx,regions,selected,projectPage,projectFilter);
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
