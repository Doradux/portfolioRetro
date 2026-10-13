// Web Audio engine for physical input on the retro desktop.
// Mouse down and up are *separate* buffers from the supplied recording, so
// holding a mouse button never schedules the release sound prematurely.
const AUDIO = {
  mouseDown: '/audio/mouse-down.mp3',
  mouseUp: '/audio/mouse-up.mp3',
  keyboard: '/audio/keyboard.mp3',
  room: '/audio/room.mp3',
};
let context = null;
let loading = null;
const buffers = new Map();
let roomStarted = false;

export function toneForKey(code) {
  // FNV-1a gives each physical KeyboardEvent.code a stable sonic identity.
  let hash = 2166136261;
  for (let i = 0; i < code.length; i++) {
    hash ^= code.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  hash >>>= 0;
  const semitones = ((hash & 255) / 255 - .5) * 1.45;
  return {
    rate: 2 ** (semitones / 12),
    cutoff: 1900 + ((hash >>> 8) & 255) / 255 * 1950,
    gain: .118 + ((hash >>> 16) & 15) / 15 * .029,
    pan: (((hash >>> 24) & 15) / 15 - .5) * .22,
  };
}

function getContext() {
  if (context) return context;
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  try { context = new Ctor(); } catch { return null; }
  return context;
}
export function preloadSounds() {
  if (loading) return loading;
  const ctx = getContext();
  if (!ctx) return Promise.resolve();
  loading = Promise.all(Object.entries(AUDIO).map(async ([name, url]) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw Error(String(res.status));
      const raw = await res.arrayBuffer();
      const decoded = await ctx.decodeAudioData(raw);
      buffers.set(name, decoded);
    } catch (e) {
      // Sound is optional: silent fallback if a codec or asset isn't supported.
      if (import.meta.env.DEV) console.warn('Retro audio unavailable:', name, e);
    }
  }));
  return loading;
}
function audioFromGesture() {
  const ctx = getContext();
  if (!ctx) return null;
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
  if (!loading) void preloadSounds();
  return ctx;
}
function playSample(kind, settings = null) {
  const ctx = audioFromGesture();
  if (!ctx) return;
  const started = performance.now();
  const play = () => {
    if (performance.now() - started > 400) return; // don't play stale inputs
    const buffer = buffers.get(kind);
    if (!buffer) return;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = settings?.rate ?? 1;
    const volume = ctx.createGain();
    volume.gain.value = settings?.gain ?? .19;
    if (settings) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = settings.cutoff;
      source.connect(filter);
      if (ctx.createStereoPanner) {
        const pan = ctx.createStereoPanner();
        pan.pan.value = settings.pan;
        filter.connect(pan);
        pan.connect(volume);
      } else {
        filter.connect(volume);
      }
    } else {
      source.connect(volume);
    }
    volume.connect(ctx.destination);
    source.onended = () => {
      source.disconnect();
      volume.disconnect();
    };
    source.start();
  };
  if (buffers.has(kind)) play();
  else if (loading) void loading.then(play);
}
export function playKeyboard(code) {
  playSample('keyboard', toneForKey(code || 'Unidentified'));
  startRoom();
}
export function playMouseDown() {
  playSample('mouseDown');
  startRoom();
}
export function playMouseUp() {
  playSample('mouseUp');
}
function startRoom() {
  const ctx = audioFromGesture();
  if (!ctx || roomStarted) return;
  roomStarted = true;
  const play = () => {
    const buffer = buffers.get('room');
    if (!buffer) {
      roomStarted = false;
      return;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = .08;
    source.loopEnd = Math.max(.1, buffer.duration - .12);
    const volume = ctx.createGain();
    volume.gain.value = .11;
    source.connect(volume);
    volume.connect(ctx.destination);
    source.start();
  };
  if (buffers.has('room')) play();
  else if (loading) void loading.then(play);
}
