# Marcos Dorado — Interactive 3D CRT Portfolio

A fully immersive retro 3D room. **The computer is the entire interface**: all visible pages, project cards, and navigation live inside its curved CRT screen.

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown by Vite (typically `http://localhost:5173`).

## Build

```bash
npm run build
npm test
npm run preview
```

The static production bundle is generated in `dist/`. Deploy it to a static hosting platform such as Netlify, Cloudflare Pages, Vercel or Nginx.

## 3D environment

- Procedural desktop PC, CRT monitor, molded rounded bezel, keyboard with fitted numpad, mouse, desk, corner plant and bookshelf.
- Window with angled blinds, light shafts and floating dust particles.
- The **computer stays fixed**. The camera rotates from a fixed central viewpoint, looking outward within a restrained cone as the pointer moves.
- Scroll to zoom; pinch to zoom on touch devices.
- Physical mouse tracks the on-screen pointer within a fixed, desk-safe X/Z rectangle; it remains visible while the real OS cursor is never hidden or captured. Left/right clicking subtly depresses and tilts it, and its contact shadow follows.
- Physical keyboard keys react to the corresponding `KeyboardEvent.code` while held, with animated key travel and a separate responsive spacebar. Multiple simultaneous keys and key releases are supported. Only active key matrices are updated for efficiency.
- Static contact shadows are cached rather than recomputed every frame. Reduced shadow-map resolution improves smoothness.
- No artificial frame-rate limit. React Three Fiber renders using the browser's `requestAnimationFrame` loop, normally synchronized to the display refresh rate.
- Reduced motion is supported via `prefers-reduced-motion`.

## CRT effects

The screen is painted on a Canvas 2D texture, mapped onto a subtly curved mesh and shaded by GLSL. Effects include barrel distortion, moving analog interference, chromatic aberration, scanlines, vignette and film grain.

The traveling horizontal interference band uses **wrapped periodic UV distance**, so it gradually leaves the upper edge while re-entering at the lower edge, with no hard jump at a phase reset.

## Navigation

All interactive pages are inside the monitor, including Home, About, Projects, Stack and Contact.

**Full project catalogue:** 35 entries: all 33 GitHub owner repositories except hist (20 public, 13 private), plus professional HPR work and the current CRT portfolio. The list is a static snapshot stored in src/lib/projectCatalog.js; no GitHub credentials or private source code are included in the built application.

Inside Projects, use All / Public / Private / Other to filter and Prev / Next or the physical left/right arrow keys to change pages. Six projects appear per page, with individual detail views. Public repositories link to GitHub; private projects show high-level summaries only.

- Click the CRT screen to navigate. Pointer tracking never disables normal browser clicking or pointer visibility.
- Press **1–5** to choose a section.
- Press **← / →** in Projects to change pages. The keyboard's inverted-T arrow cluster reacts to matching physical keys.
- Press **Escape** to close a project.
- Press **F** to toggle CRT effects.
- Use **+ / -** or the mouse wheel for camera zoom.
- When WebGL is unavailable, an accessible English HTML fallback is displayed.

Content and GitHub links are editable in `src/lib/projectCatalog.js`. Private employer details and source code are intentionally excluded.

## Stack

React 19, Vite 7, Three.js, React Three Fiber, Drei and GLSL shaders.

## Profiles

- GitHub: https://github.com/Doradux
- LinkedIn: https://www.linkedin.com/in/marcosdorado/
