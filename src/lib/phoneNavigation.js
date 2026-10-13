import { navItems, projects, tech, experiences, education, socials } from './content.js';

export const PHONE_SECTIONS=navItems.map(x=>x.id);
export const PHONE_ROWS_PER_PAGE=4;
export const PHONE_CONTACTS=[
  {label:'EMAIL',url:socials.email},
  {label:'GITHUB',url:socials.github},
  {label:'LINKEDIN',url:socials.linkedin}
];
export const PHONE_SKILLS=tech.map(t=>t.label);

export function initialPhoneFocus(page='home') {
  return {mode:'content',menuIndex:Math.max(0,PHONE_SECTIONS.indexOf(page)),
    projectIndex:0,detailScroll:0,skillIndex:0,contactIndex:0,aboutIndex:0};
}
const clamp=(n,max)=>Math.max(0,Math.min(max,n));
export function updatePhoneFocus(focus,action,view={}) {
  const page=view.page||'home';
  const detail=Boolean(view.selectedProject);
  const state={...focus};
  let command=null;
  if(action==='menu') {
    state.mode='menu';
    state.menuIndex=Math.max(0,PHONE_SECTIONS.indexOf(page));
  } else if(action==='back') {
    if(detail){command={kind:'navigate',page:'projects'};state.mode='content';}
    else if(state.mode==='menu') {
      state.mode='content';command={kind:'navigate',page:'home'};
    } else {
      state.mode='menu';state.menuIndex=Math.max(0,PHONE_SECTIONS.indexOf(page));
    }
  } else if(state.mode==='menu') {
    if(action==='up'||action==='down') {
      const step=action==='up'?-1:1;
      state.menuIndex=(state.menuIndex+step+PHONE_SECTIONS.length)%PHONE_SECTIONS.length;
    }
    if(action==='left')state.menuIndex=(state.menuIndex+PHONE_SECTIONS.length-1)%PHONE_SECTIONS.length;
    if(action==='right')state.menuIndex=(state.menuIndex+1)%PHONE_SECTIONS.length;
    if(action==='ok') {
      command={kind:'navigate',page:PHONE_SECTIONS[state.menuIndex]};
      state.mode='content';
    }
  } else if(page==='projects') {
    if(detail) {
      if(action==='up')state.detailScroll=clamp(state.detailScroll-1,24);
      if(action==='down')state.detailScroll=clamp(state.detailScroll+1,24);
      if(action==='left'||action==='right') {
        const idx=projects.findIndex(p=>p.id===view.selectedProject);
        const next=clamp(idx+(action==='right'?1:-1),projects.length-1);
        state.projectIndex=next;
        state.detailScroll=0;
        if(next!==idx)command={kind:'project',id:projects[next].id};
      }
      if(action==='ok') {
        const project=projects.find(p=>p.id===view.selectedProject);
        if(project?.link)command={kind:'external',url:project.link};
      }
    } else {
      if(action==='up')state.projectIndex=clamp(state.projectIndex-1,projects.length-1);
      if(action==='down')state.projectIndex=clamp(state.projectIndex+1,projects.length-1);
      if(action==='left')state.projectIndex=clamp(state.projectIndex-PHONE_ROWS_PER_PAGE,projects.length-1);
      if(action==='right')state.projectIndex=clamp(state.projectIndex+PHONE_ROWS_PER_PAGE,projects.length-1);
      if(action==='ok'){
        state.detailScroll=0;
        command={kind:'project',id:projects[state.projectIndex].id};
      }
    }
  } else if(page==='skills') {
    if(action==='down'||action==='right')state.skillIndex=(state.skillIndex+1)%tech.length;
    if(action==='up'||action==='left')state.skillIndex=(state.skillIndex+tech.length-1)%tech.length;
  } else if(page==='about') {
    const count=3;
    if(action==='down'||action==='right')state.aboutIndex=(state.aboutIndex+1)%count;
    if(action==='up'||action==='left')state.aboutIndex=(state.aboutIndex+count-1)%count;
  } else if(page==='contact') {
    if(action==='down'||action==='right')state.contactIndex=(state.contactIndex+1)%PHONE_CONTACTS.length;
    if(action==='up'||action==='left')state.contactIndex=(state.contactIndex+PHONE_CONTACTS.length-1)%PHONE_CONTACTS.length;
    if(action==='ok')command={kind:'external',url:PHONE_CONTACTS[state.contactIndex].url};
  } else if(page==='home' && action==='ok') {
    state.mode='menu';
    state.menuIndex=2; // Highlight Projects, the most useful first destination.
  }
  return {state,command};
}
