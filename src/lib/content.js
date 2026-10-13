export const socials = {
  github: 'https://github.com/Doradux',
  linkedin: 'https://www.linkedin.com/in/marcosdorado/',
  email: 'mailto:marcosloldorado@gmail.com'
};

export const projects = [
  {
    id: 'hpr', number: '01', title: 'HPR', category: 'ERP / INDUSTRIA',
    label: 'SOFTWARE PROFESIONAL', year: '2025 — ACTUALIDAD',
    description: 'Desarrollo y evolución de una plataforma ERP para procesos de negocio reales: interfaces de gestión, flujos de trabajo, integraciones y automatización.',
    detail: 'Una aplicación de producción en la que trabajo de forma continuada. Desarrollo nuevas funciones, mejoro experiencias complejas, corrijo incidencias y mantengo integraciones. Los detalles y el código internos se mantienen privados.',
    stack: ['Laravel', 'PHP', 'Vue', 'React', 'MySQL', 'Redis'],
    link: null, linkText: null, hue: '#b1dd88'
  },
  {
    id: 'doradotv', number: '02', title: 'DoradoTV', category: 'STREAMING / PRODUCTO',
    label: 'PROYECTO PERSONAL', year: '2026',
    description: 'Una plataforma multimedia con salas privadas, roles, reproducción en directo y bajo demanda, y servicios de transmisión.',
    detail: 'Construí un producto con cuentas, salas, propietarios e invitados, controles de acceso y gestión de fuentes multimedia. Integra servicios externos, reproducción HLS y un relay orientado a la compatibilidad entre navegadores.',
    stack: ['JavaScript', 'Vite', 'Node.js', 'HLS', 'OAuth', 'APIs'],
    link: 'https://github.com/Doradux/doradoTV', linkText: 'REPOSITORIO', hue: '#e1b5f5'
  },
  {
    id: 'albuvo', number: '03', title: 'Albuvo', category: 'FULL STACK / SAAS',
    label: 'PROYECTO PERSONAL', year: '2026',
    description: 'Álbumes privados y colaborativos: invitaciones, cuentas, subidas de fotos, permisos y procesamiento asíncrono.',
    detail: 'Arquitectura separada en SPA, API, worker y scheduler. El sistema incorpora autenticación, invitaciones para colaborar y subida de imágenes con procesamiento en segundo plano.',
    stack: ['Vue 3', 'TypeScript', 'Laravel', 'PostgreSQL', 'Redis', 'Docker'],
    link: 'https://github.com/Doradux/Albuvo', linkText: 'REPOSITORIO', hue: '#ffcb8c'
  },
  {
    id: 'draw', number: '04', title: 'DrawTheGame', category: 'REALTIME / MULTIJUGADOR',
    label: 'PROYECTO PERSONAL', year: '2025 — 2026',
    description: 'Juego multijugador de dibujo y adivinanzas con salas, chat y trazos sincronizados en tiempo real.',
    detail: 'Experiencia multijugador con sincronización de canvas, chat en directo, puntuaciones, modalidades de juego y una arquitectura de comunicación de baja latencia.',
    stack: ['React', 'TypeScript', 'NestJS', 'Socket.IO', 'PostgreSQL'],
    link: null, linkText: null, hue: '#83cad7'
  },
  {
    id: 'scanner', number: '05', title: 'AI Vulnerability Scanner', category: 'SEGURIDAD / IA',
    label: 'OPEN SOURCE', year: '2026',
    description: 'Herramienta de análisis de seguridad que orquesta OWASP ZAP y explica hallazgos con ayuda de modelos de IA.',
    detail: 'Proyecto de experimentación que combina análisis dinámico y estático, detección del stack tecnológico y generación de informes comprensibles a partir de resultados técnicos.',
    stack: ['Python', 'OWASP ZAP', 'Gemini', 'SAST', 'DAST'],
    link: 'https://github.com/Doradux/Vulnerabilidades-ScanApp-ZAP-addon', linkText: 'REPOSITORIO', hue: '#f7a9ac'
  },
  {
    id: 'cex', number: '06', title: 'Cex', category: 'COMUNICACIÓN / WEB',
    label: 'PROYECTO ACADÉMICO', year: '2024',
    description: 'Aplicación web de comunidades y comunicación inspirada en Discord y Teams, con servidores, mensajería y videollamadas.',
    detail: 'Proyecto final de Desarrollo de Aplicaciones Web: gestión de usuarios, canales y servidores, chat en tiempo real mediante peticiones asíncronas y videollamadas WebRTC.',
    stack: ['PHP', 'JavaScript', 'MySQL', 'AJAX', 'WebRTC'],
    link: 'https://github.com/Doradux/Cex', linkText: 'REPOSITORIO', hue: '#edca89'
  }
];

export const tech = [
  { label: 'FRONTEND', items: ['JavaScript', 'TypeScript', 'Vue 3', 'React', 'Angular', 'HTML / CSS', 'Tailwind'] },
  { label: 'BACKEND', items: ['PHP', 'Laravel', 'Node.js', 'Java', 'Spring Boot', 'REST APIs', 'WebSockets'] },
  { label: 'DATOS & INFRA', items: ['MySQL', 'PostgreSQL', 'Redis', 'Docker', 'Linux', 'Git', 'Nginx'] },
  { label: 'CALIDAD & IA', items: ['Cypress', 'Selenium', 'Postman', 'Python', 'OWASP ZAP', 'Gemini / OpenAI'] }
];

export const experiences = [
  { period: '2025 — HOY', role: 'Desarrollo de software / Full Stack', company: 'Hierros Paco Reyes', description: 'Desarrollo y mantenimiento de aplicaciones internas, ERP y herramientas de gestión de procesos.' },
  { period: 'ETAPA DE PRÁCTICAS', role: 'QA & Testing', company: 'Eviden', description: 'Pruebas funcionales, automatización y validación de aplicaciones con herramientas de testing.' }
];

export const education = [
  { year: '2026 —', title: 'Grado en Ingeniería Informática', school: 'UNED · en curso' },
  { year: '2024 — 2025', title: 'Especialización en IA y Big Data', school: 'Formación profesional' },
  { year: '2022 — 2024', title: 'Desarrollo de Aplicaciones Web', school: 'CFGS · Técnico Superior' },
  { year: '2025', title: 'AWS Academy', school: 'Cloud Foundations · Machine Learning Foundations' }
];

export const navItems = [
  { id: 'home', label: 'INICIO', key: '01' },
  { id: 'about', label: 'SOBRE MÍ', key: '02' },
  { id: 'projects', label: 'PROYECTOS', key: '03' },
  { id: 'skills', label: 'STACK', key: '04' },
  { id: 'contact', label: 'CONTACTO', key: '05' }
];

export const labProjects = [
  { title: 'Trade Cycling', type: 'JAVA / MODDING', detail: 'Addon para buscar encantamientos en intercambios de aldeanos.', href: 'https://github.com/Doradux/Trade-Cycling-Enchantment-Search' },
  { title: 'Spring Kiosko', type: 'JAVA / SPRING BOOT', detail: 'Aplicación de kiosco desarrollada con el framework Spring.', href: 'https://github.com/Doradux/spring-kiosko' },
  { title: 'Minecraft Server Bot', type: 'PYTHON / DISCORD', detail: 'Bot para consultar el estado de un servidor de Minecraft.', href: 'https://github.com/Doradux/minecraft-server-status-discord-bot' },
  { title: 'IABD Course', type: 'PYTHON / IA & DATOS', detail: 'Prácticas y ejercicios de inteligencia artificial y Big Data.', href: 'https://github.com/Doradux/IABD-Course' },
  { title: 'Autochollo', type: 'NODE.JS / AUTOMATIZACIÓN', detail: 'Experimentos de rastreo y automatización de ofertas.', href: null },
  { title: 'OMWay', type: 'MOBILE / MULTIPLATAFORMA', detail: 'Exploraciones con React Native, servicios y comunicación en tiempo real.', href: null }
];
