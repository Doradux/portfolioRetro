# Marcos Dorado — Portfolio CRT 3D

Portfolio personal de Marcos Dorado construido como una habitación retro 3D inmersiva. Toda la navegación funciona exclusivamente dentro de la pantalla de un ordenador CRT.

## Ejecutar

```bash
npm install
npm run dev
```

Abrir la URL indicada por Vite (por defecto `http://localhost:5173`).

## Producción

```bash
npm run build
npm run preview
```

El resultado estático se genera en `dist/`, apto para Vercel, Netlify, Cloudflare Pages o Nginx.

## Diseño / interacción

- Modelado 3D procedural con Three.js y React Three Fiber: carcasa CRT, marco, pedestal, teclado, ratón y escritorio.
- Habitación en 3D con paredes, mobiliario, ventana con persianas inclinadas, iluminación cálida y haces de luz con shaders translúcidos.
- Polvo suspendido iluminado por la ventana con partículas GPU animadas.
- El ordenador permanece inmóvil: se desplaza muy suavemente la posición del observador (POV) en respuesta al ratón.
- La pantalla es una textura Canvas 2D aplicada sobre un material shader de WebGL con curvatura, ondas de desplazamiento horizontales, scanlines, aberración cromática, viñeteo, ruido y banda de barrido móvil.
- La interfaz del monitor tiene zonas interactivas detectadas mediante raycasting (clic en menú y proyectos).
- Toda la interfaz visible está dentro del CRT; atajos de teclado 1–5 para navegar, Escape para volver y F para alternar los efectos CRT.
- Interfaz HTML alternativa si WebGL no está disponible.
- Zoom progresivo sobre el ordenador mediante la rueda del ratón, teclas + y -, o gesto de pellizco en pantallas táctiles.\n- Opción de reducir efectos, y respeto a `prefers-reduced-motion`.
- Fallback si WebGL no está disponible.

## Contenido

Los textos del portfolio están en `src/lib/content.js`. Los proyectos privados carecen de enlaces directos; los proyectos públicos enlazan al repositorio de GitHub correspondiente. No se incluyen información empresarial confidencial ni credenciales.

## Tecnologías

React 19, Vite 7, Three.js, @react-three/fiber, @react-three/drei, CSS.

## Enlaces

- GitHub: https://github.com/Doradux
- LinkedIn: https://www.linkedin.com/in/marcosdorado/
