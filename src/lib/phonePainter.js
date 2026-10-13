import {navItems,projects,tech,experiences,education} from './content.js';
import {PHONE_CONTACTS,PHONE_ROWS_PER_PAGE} from './phoneNavigation.js';

export const PHONE_SCREEN_WIDTH=480;
export const PHONE_SCREEN_HEIGHT=576;
const W=PHONE_SCREEN_WIDTH,H=PHONE_SCREEN_HEIGHT;
const ink='#122923',muted='#395a4c',accent='#a8dc9c',paper='#c4d8bc';
function rect(c,x,y,w,h,fill,r=0,stroke=null){
  c.beginPath();
  if(r)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);
  if(fill){c.fillStyle=fill;c.fill();}
  if(stroke){c.lineWidth=2;c.strokeStyle=stroke;c.stroke();}
}
function line(c,text,x,y,size=25,color=ink,bold=false,maxW=W-46) {
  c.font=(bold?'700 ':'500 ')+size+'px "Space Mono",monospace';
  c.fillStyle=color;
  let value=text;
  while(c.measureText(value).width>maxW&&value.length>2)value=value.slice(0,-2)+'…';
  c.fillText(value,x,y);
}
function wrap(c,text,x,y,maxW,step=37,maxLines=5,size=23,color=ink){
  c.font='500 '+size+'px "Space Mono",monospace';c.fillStyle=color;
  const words=text.split(/\s+/);
  let current='',row=0;
  for(let i=0;i<words.length;i++){
    const next=current?current+' '+words[i]:words[i];
    if(c.measureText(next).width>maxW&&current){
      c.fillText(current,x,y+row*step);row++;current=words[i];
      if(row>=maxLines)return;
    }else current=next;
  }
  if(row<maxLines&&current)c.fillText(current,x,y+row*step);
}
function descriptionLines(c,text,width=428,size=21){
  c.font='500 '+size+'px "Space Mono",monospace';
  const words=String(text||'').split(/\s+/);
  const lines=[];
  let current='';
  for(const word of words){
    const next=current?current+' '+word:word;
    if(current&&c.measureText(next).width>width){
      lines.push(current);
      current=word;
    }else current=next;
  }
  if(current)lines.push(current);
  return lines;
}
function selectedRow(c,y,label,active,detail='',height=60) {
  rect(c,21,y,W-42,height,active?'#264d41':'#b6cbb2',10,active?'#122f27':'#88a994');
  if(active)rect(c,25,y+10,5,height-20,accent,2);
  line(c,label,40,y+37,24,active?'#effde6':ink,true,W-92);
  if(detail)line(c,detail,42,y+height-10,17,active?'#c4edb7':muted,false,W-85);
  if(active)line(c,'›',W-56,y+36,26,accent,true,32);
}
function frame(c,mode,title,subtitle){
  rect(c,0,0,W,H,paper);
  rect(c,0,0,W,68,'#234537');
  line(c,'DORADos',20,43,29,'#e7f2de',true,220);
  line(c,mode==='menu'?'MENU':'ONLINE',344,43,19,accent,true,120);
  rect(c,0,68,W,3,'#89a992');
  line(c,title,23,117,35,ink,true,W-40);
  if(subtitle)line(c,subtitle,24,154,19,muted,false,W-48);
}
export function paintPhoneScreen(canvas,{page='home',selectedProject=null,focus}){
  const c=canvas.getContext('2d');
  c.clearRect(0,0,W,H);
  const mode=focus.mode;
  if(mode==='menu') {
    frame(c,'menu','SECTIONS','Use arrows + OK');
    navItems.forEach((item,i)=>{
      selectedRow(c,179+i*68,
        item.key+'  '+item.label,i===focus.menuIndex,'',60);
    });
  } else if(page==='home'){
    frame(c,'content','WELCOME','/home/dorado/whoami');
    line(c,"HELLO, I'M",27,224,29);
    line(c,'MARCOS',26,307,64,ink,true);
    line(c,'DORADO',26,379,64,ink,true);
    line(c,'FULL STACK DEV',28,428,23,muted,true);
    rect(c,27,460,425,64,'#24463b',9);
    line(c,'OK  ›  EXPLORE',49,502,26,'#e3f2d8',true);
  } else if(page==='projects' && selectedProject) {
    const p=projects.find(v=>v.id===selectedProject);
    frame(c,'content','PROJECT',p?.number+' / '+p?.visibility?.toUpperCase());
    line(c,p?.title||'PROJECT',23,215,35,ink,true);
    rect(c,21,245,438,2,'#91ad9a');
    const lines=descriptionLines(c,p?.detail||p?.description||'');
    const start=Math.min(focus.detailScroll,Math.max(0,lines.length-5));
    lines.slice(start,start+5).forEach((value,i)=>line(c,value,27,291+i*33,21,ink));
    line(c,'TECH',27,452,20,muted,true);
    wrap(c,p?.stack?.join(' · ')||'',27,480,416,29,2,20);
    line(c,p?.link?'OK: OPEN GITHUB':'SOURCE: PRIVATE',26,540,18,muted);
    line(c,lines.length>5?'▲▼ READ  ◀▶ PROJECT':'◀▶ CHANGE PROJECT',26,565,16,muted,true);
  } else if(page==='projects'){
    const start=Math.floor(focus.projectIndex/PHONE_ROWS_PER_PAGE)*PHONE_ROWS_PER_PAGE;
    frame(c,'content','PROJECTS',
      (focus.projectIndex+1)+' / '+projects.length+'  •  ◀ ▶ pages');
    for(let i=0;i<PHONE_ROWS_PER_PAGE;i++){
      const project=projects[start+i];
      if(!project)continue;
      selectedRow(c,185+i*91,project.title,
        focus.projectIndex===start+i,
        project.visibility==='private'?'PRIVATE':project.category,81);
    }
    line(c,'OK DETAILS   MENU SECTIONS',28,565,17,muted,true);
  } else if(page==='about'){
    frame(c,'content','ABOUT ME','Who I am / Experience / Studies');
    if(focus.aboutIndex===0) {
      line(c,'FULL STACK DEVELOPER',24,217,26,ink,true);
      wrap(c,'I build digital products from frontend to backend, combining creative design with practical engineering.',26,271,426,41,6,23);
    } else if(focus.aboutIndex===1){
      line(c,'EXPERIENCE',24,217,26,ink,true);
      experiences.forEach((e,i)=>{
        line(c,e.role,27,287+i*134,23,ink,true);
        line(c,e.company,28,320+i*134,20,muted);
      });
    } else {
      line(c,'EDUCATION',24,217,26,ink,true);
      education.slice(0,3).forEach((e,i)=>{
        line(c,e.title,27,268+i*97,22,ink,true);
        line(c,e.school,28,295+i*97,18,muted);
      });
    }
    line(c,'◀ ▶  '+(focus.aboutIndex+1)+'/3',26,546,21,muted,true);
  } else if(page==='skills'){
    const selected=tech[focus.skillIndex];
    frame(c,'content','TOOLKIT',(focus.skillIndex+1)+' / '+tech.length);
    line(c,selected.label,26,226,31,ink,true);
    selected.items.forEach((item,i)=>{
      line(c,'› '+item,33,274+i*37,24,ink,false,W-63);
    });
    line(c,'▲ ▼ SWITCH CATEGORY',26,551,19,muted,true);
  } else if(page==='contact'){
    frame(c,'content','CONTACT','Let’s build something');
    line(c,'MARCOS DORADO',25,237,31,ink,true);
    line(c,'FULL STACK DEVELOPER',27,278,19,muted);
    PHONE_CONTACTS.forEach((item,i)=>
      selectedRow(c,332+i*70,item.label,focus.contactIndex===i,'',61));
    line(c,'OK OPEN LINK',28,560,18,muted,true);
  } else {
    frame(c,'content','DORADos','Mobile terminal');
  }
  // LCD glass edges and persistent key hints.
  rect(c,0,0,W,H,null,8,'#799784');
  c.fillStyle='rgba(247,255,239,.055)';
  for(let y=0;y<H;y+=4)c.fillRect(0,y,W,1);
  return c;
}
