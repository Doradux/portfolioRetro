export const socials = {
  github: 'https://github.com/Doradux',
  linkedin: 'https://www.linkedin.com/in/marcosdorado/',
  email: 'mailto:marcosloldorado@gmail.com'
};

export const projects = [
  {
    id: 'hpr', number: '01', title: 'HPR', category: 'ERP / INDUSTRY',
    label: 'PROFESSIONAL SOFTWARE', year: '2025 — PRESENT',
    description: 'Building and evolving an ERP platform for real business operations: management interfaces, workflows, integrations and automation.',
    detail: 'A production application I work on continuously. I build new features, improve complex workflows, solve issues and maintain integrations. Internal code and business details remain private.',
    stack: ['Laravel', 'PHP', 'Vue', 'React', 'MySQL', 'Redis'],
    link: null, linkText: null, hue: '#b1dd88'
  },
  {
    id: 'doradotv', number: '02', title: 'DoradoTV', category: 'STREAMING / PRODUCT',
    label: 'PERSONAL PROJECT', year: '2026',
    description: 'A multimedia platform with private rooms, roles, live and on-demand playback, and streaming services.',
    detail: 'I built a product with accounts, rooms, owners and guests, access controls and multimedia source management. It integrates external services, HLS playback and a relay designed for cross-browser compatibility.',
    stack: ['JavaScript', 'Vite', 'Node.js', 'HLS', 'OAuth', 'APIs'],
    link: 'https://github.com/Doradux/doradoTV', linkText: 'REPOSITORY', hue: '#e1b5f5'
  },
  {
    id: 'albuvo', number: '03', title: 'Albuvo', category: 'FULL STACK / SAAS',
    label: 'PERSONAL PROJECT', year: '2026',
    description: 'Private collaborative photo albums with invitations, accounts, image uploads, permissions and asynchronous processing.',
    detail: 'A modular architecture with a SPA, API, worker and scheduler. The system includes authentication, collaborative invitations and background image processing.',
    stack: ['Vue 3', 'TypeScript', 'Laravel', 'PostgreSQL', 'Redis', 'Docker'],
    link: 'https://github.com/Doradux/Albuvo', linkText: 'REPOSITORY', hue: '#ffcb8c'
  },
  {
    id: 'draw', number: '04', title: 'DrawTheGame', category: 'REALTIME / MULTIPLAYER',
    label: 'PERSONAL PROJECT', year: '2025 — 2026',
    description: 'A multiplayer drawing and guessing game with rooms, chat and real-time synchronized brush strokes.',
    detail: 'Multiplayer experience featuring synchronized canvases, live chat, scoring, game modes and a low-latency communication architecture.',
    stack: ['React', 'TypeScript', 'NestJS', 'Socket.IO', 'PostgreSQL'],
    link: null, linkText: null, hue: '#83cad7'
  },
  {
    id: 'scanner', number: '05', title: 'AI Vulnerability Scanner', category: 'SECURITY / AI',
    label: 'OPEN SOURCE', year: '2026',
    description: 'A security analysis tool that orchestrates OWASP ZAP and uses AI models to explain findings.',
    detail: 'An experimental project combining dynamic and static analysis, technology stack detection and accessible reports generated from technical findings.',
    stack: ['Python', 'OWASP ZAP', 'Gemini', 'SAST', 'DAST'],
    link: 'https://github.com/Doradux/Vulnerabilidades-ScanApp-ZAP-addon', linkText: 'REPOSITORY', hue: '#f7a9ac'
  },
  {
    id: 'cex', number: '06', title: 'Cex', category: 'COMMUNICATION / WEB',
    label: 'ACADEMIC PROJECT', year: '2024',
    description: 'A community and communication web app inspired by Discord and Teams, featuring servers, messaging and video calls.',
    detail: 'My final Web Application Development project: user, channel and server management, asynchronous chat updates and WebRTC video calls.',
    stack: ['PHP', 'JavaScript', 'MySQL', 'AJAX', 'WebRTC'],
    link: 'https://github.com/Doradux/Cex', linkText: 'REPOSITORY', hue: '#edca89'
  }
];

export const tech = [
  { label: 'FRONTEND', items: ['JavaScript', 'TypeScript', 'Vue 3', 'React', 'Angular', 'HTML / CSS', 'Tailwind'] },
  { label: 'BACKEND', items: ['PHP', 'Laravel', 'Node.js', 'Java', 'Spring Boot', 'REST APIs', 'WebSockets'] },
  { label: 'DATA & INFRA', items: ['MySQL', 'PostgreSQL', 'Redis', 'Docker', 'Linux', 'Git', 'Nginx'] },
  { label: 'QA & AI', items: ['Cypress', 'Selenium', 'Postman', 'Python', 'OWASP ZAP', 'Gemini / OpenAI'] }
];

export const experiences = [
  { period: '2025 — PRESENT', role: 'Full Stack Software Developer', company: 'Hierros Paco Reyes', description: 'Development and maintenance of internal applications, ERP software and business process tools.' },
  { period: 'INTERNSHIP', role: 'QA & Testing', company: 'Eviden', description: 'Functional testing, automation and application validation using professional QA tools.' }
];

export const education = [
  { year: '2026 —', title: 'BSc Computer Engineering', school: 'UNED · in progress' },
  { year: '2024 — 2025', title: 'AI & Big Data Specialization', school: 'Vocational specialization' },
  { year: '2022 — 2024', title: 'Web Application Development', school: 'Higher Vocational Diploma' },
  { year: '2025', title: 'AWS Academy', school: 'Cloud Foundations · Machine Learning Foundations' }
];

export const navItems = [
  { id: 'home', label: 'HOME', key: '01' },
  { id: 'about', label: 'ABOUT', key: '02' },
  { id: 'projects', label: 'PROJECTS', key: '03' },
  { id: 'skills', label: 'STACK', key: '04' },
  { id: 'contact', label: 'CONTACT', key: '05' }
];

export const labProjects = [
  { title: 'Trade Cycling', type: 'JAVA / MODDING', detail: 'Addon to search for specific enchanted-book villager trades.', href: 'https://github.com/Doradux/Trade-Cycling-Enchantment-Search' },
  { title: 'Spring Kiosko', type: 'JAVA / SPRING BOOT', detail: 'Kiosk application developed with the Spring framework.', href: 'https://github.com/Doradux/spring-kiosko' },
  { title: 'Minecraft Server Bot', type: 'PYTHON / DISCORD', detail: 'Bot that reports the status of a Minecraft server.', href: 'https://github.com/Doradux/minecraft-server-status-discord-bot' },
  { title: 'IABD Course', type: 'PYTHON / IA & DATOS', detail: 'AI and Big Data exercises and experiments.', href: 'https://github.com/Doradux/IABD-Course' },
  { title: 'Autochollo', type: 'NODE.JS / AUTOMATION', detail: 'Price tracking and deal automation experiments.', href: null },
  { title: 'OMWay', type: 'MOBILE / CROSS-PLATFORM', detail: 'Experiments with React Native, services and realtime communication.', href: null }
];
