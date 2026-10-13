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
- The physical CRT front-panel button toggles CRT effects; the F key is not a toggle.
- Use **+ / -** or the mouse wheel for camera zoom.
- When WebGL is unavailable, an accessible English HTML fallback is displayed.

Content and GitHub links are editable in `src/lib/projectCatalog.js`. Private employer details and source code are intentionally excluded.

## Stack

React 19, Vite 7, Three.js, React Three Fiber, Drei and GLSL shaders.

## Profiles

- GitHub: https://github.com/Doradux
- LinkedIn: https://www.linkedin.com/in/marcosdorado/

## Display and controls (2026 refresh)

- DORADos branding and /home/dorado/whoami explorer path
- No keyboard F shortcut to change CRT render effects; use the monitor control button instead
- Lowered the physical spacebar to match the height of its surrounding keys
- Warm window sunshine is directed over the desk and casts dynamic shadows from the monitor, mouse and keyboard
- Zooming raises the camera and focal point together, preserving the top edge of the CRT
- The wired, rectangular mouse stays constrained to the desk and depresses the left/right buttons separately
- Native right-click context menus are prevented inside the immersive scene


## Retro audio

The audio samples are drawn from the recordings supplied for this portfolio.
Mouse clicking plays the **press** transient on mousedown and the **release**
transient only when that button is actually released. Holding a button does not
schedule or replay the release sound. Left and right buttons are tracked
independently, including simultaneous presses and releases in either order.
MouseEvent.buttons reconciles missed events after leaving/re-entering the viewport;
blur and page hiding also clear held visual states so no button stays pressed.
The input tracker lives in src/lib/mouseButtonTracker.js and has automated
two-button regression tests.

Keyboard presses use the physical key code as a stable hash seed for subtle
pitch, cutoff-frequency, stereo and level differences. A always sounds like A,
while B has its own consistent sound. Holding a key never retriggers it through
the operating system's key-repeat events. Key, mouse and room audio are decoded
with Web Audio; room ambience remains quiet and starts after the first real
user interaction, avoiding blocked autoplay. Unsupported audio simply fails
silently without stopping the 3D portfolio.

## Sound controls and favicon

The browser title is **Marcos Dorado**. The favicon is a transparent, cropped
illustration of a beige CRT monitor saved as **public/favicon.png**.

The fixed top-right **sound control** is outside the computer's 3D scene and
works on desktop and mobile. It mutes/unmutes all Web Audio with a single
master gain, including clicks, keyboard and the continuous room ambience.
The preference is stored in browser localStorage and survives reloads.
The mute button doesn't create a physical 3D mouse click.


## Cursor interaction continuity

The CRT pointer hover is tracked by the last actual UV hit point, not by a
stale region index. When a project page/filter/detail view changes, the
monitor redraws its hit regions and recalculates hover in-place. The cursor
and visual highlight remain active beneath an unmoved pointer; pagination
buttons lose hover only at disabled page boundaries or when the pointer
actually leaves the screen.

## Mobile phone mode

On a mobile-sized or coarse-pointer viewport, the camera looks down onto the
actual handset on the desk. Its fitted LCD bezel and display are genuine 3D
objects (with a live, readable 480×576 texture), not an HTML panel over the
scene. The seven physical keys work by touch:

- **▲ ▼ ◀ ▶** move through sections, projects, categories and contacts
- **OK** opens the highlighted section or project (or an authorized link)
- **Back** returns to the project listing or menu without losing selection
- **Menu** focuses the five main portfolio sections

All 35 projects, including high-level private project summaries but no private
source code links, remain accessible. The selected section is highlighted when
Menu is pressed, and project lists scroll in groups of four. Touch interactions
also have tactile key sound feedback. Desktop view keeps its original interactive
CRT experience. On mobile, hardware keyboard Arrow keys, Enter, Escape,
Backspace and M can also operate the phone.


The phone camera is positioned closer and more directly above the handset,
with portrait/landscape FOV padding that keeps the entire body visible.
All seven hardware symbols are drawn using Canvas vector paths (solid
triangles, curved back arrow, horizontal menu lines) rather than emoji-prone
Unicode arrow glyphs; the controls look consistent on iOS and Android.

### Near-top-down mobile camera

The mobile viewport looks at the desk handset from almost straight above:
the 3D camera is ~5 degrees off the desktop normal and uses a 68-degree
vertical field of view to show the entire phone with visible margins.
The handset is larger than before in portrait, stays fully in frame in
landscape, and the decorative desktop CRT is hidden only on mobile to
keep the focus on the interactive phone. Desktop rendering is unchanged.

## CRT hitbox accuracy

The CRT barrel-distortion shader remaps texture UVs before displaying them.
Raycasting still reports the *undistorted* physical glass UV, which previously
shifted hitboxes below visibly rendered controls near the bottom of the screen
(e.g. Projects PREV/NEXT). The hit-test now uses the shader's identical UV
mapping, including the subtly rolling interference and the on/off effects
state, for hover and pointer clicks. This keeps the visible and clickable
areas coincident across pages without enlarging invisible hitboxes.


### Mouse cable routing

The retro mouse cord follows a smooth Catmull–Rom path alongside the right
edge of the computer and turns behind its rear panel. The socket stays
physically attached to the mouse, while the nearest two cable bends follow
with separate, frame-rate-independent, damped spring motion. Rapid mouse
movements therefore bend the cable and the loose loop settles naturally
instead of moving like a rigid rod. The outer route is constrained to avoid
the computer. Automated tests cover 81 stationary pointer positions and
dynamic direction changes at 30, 60 and 120 FPS.
