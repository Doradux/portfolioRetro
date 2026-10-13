// Hit-test the monitor's canvas coordinates using its actual screen UV.
// Region indices are regenerated whenever the CRT changes page or filter.
export function screenRegionAtUv(regions, uv, width, height) {
  if (!uv || !Number.isFinite(uv.x) || !Number.isFinite(uv.y)) return -1;
  const x = uv.x * width;
  const y = (1 - uv.y) * height;
  return regions.findIndex(r => x >= r.x && x <= r.x + r.w &&
    y >= r.y && y <= r.y + r.h);
}
