// The CRT ShaderMaterial samples the canvas from warped UVs, not the raw
// plane UV returned by the Three.js raycaster. Hit-test in the *same sampled*
// coordinates as the user sees; the mismatch is largest near the bottom edge
// (where the project's PREV/NEXT controls are drawn).
export function crtSampleUv(uv, effects = true, time = 0) {
  if (!uv || !Number.isFinite(uv.x) || !Number.isFinite(uv.y)) return null;
  if (!effects) return {x:uv.x,y:uv.y};
  const cx = uv.x * 2 - 1;
  const cy = uv.y * 2 - 1;
  const d = (cx * cx + cy * cy) * .029;
  const y = uv.y + cy * d;
  const roll = ((time * .061) % 1 + 1) % 1;
  const seamDist = Math.abs((((y-roll+.5)%1+1)%1)-.5);
  const band = Math.exp(-Math.pow(seamDist * 24,2));
  const x = uv.x + cx * d +
    .0014 * Math.sin(y * 21.5 - time * 1.37) +
    .0008 * Math.sin(y * 59 + time * .65) +
    .0030 * band;
  return {x,y};
}

export function screenRegionAtUv(regions, uv, width, height, effects=false, time=0) {
  const sampled = crtSampleUv(uv,effects,time);
  if (!sampled) return -1;
  // The shader returns black outside the sampled image, so no hit may live
  // there even if a raycast lands on the physical glass.
  if (sampled.x <= .003 || sampled.x >= .997 ||
      sampled.y <= .003 || sampled.y >= .997) return -1;
  const x = sampled.x * width;
  const y = (1 - sampled.y) * height;
  return regions.findIndex(r=>x>=r.x && x<=r.x+r.w &&
    y>=r.y && y<=r.y+r.h);
}
