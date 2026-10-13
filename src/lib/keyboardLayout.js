// Browser KeyboardEvent.code -> one physical keycap; independent of layout.
// The inverted-T arrow cluster sits directly beside the numeric keypad:
//              Up
//        Left  Down  Right
export const KEY_ROWS = [
  ['Escape','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','PrintScreen','Delete'],
  ['Backquote','Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0','Minus','Equal','Backspace','Insert'],
  ['Tab','KeyQ','KeyW','KeyE','KeyR','KeyT','KeyY','KeyU','KeyI','KeyO','KeyP','BracketLeft','BracketRight','Backslash','Home'],
  ['CapsLock','KeyA','KeyS','KeyD','KeyF','KeyG','KeyH','KeyJ','KeyK','KeyL','Semicolon','Quote','Enter','End','PageUp'],
  ['ShiftLeft','KeyZ','KeyX','KeyC','KeyV','KeyB','KeyN','KeyM','Comma','Period','Slash','ShiftRight','ControlRight','ArrowUp','PageDown'],
  ['ControlLeft','MetaLeft','AltLeft','IntlBackslash','Fn',null,null,null,null,null,'AltRight','MetaRight','ArrowLeft','ArrowDown','ArrowRight']
];
export const NUMPAD_ROWS=[
  ['NumLock','NumpadDivide','NumpadMultiply','NumpadSubtract'],
  ['Numpad7','Numpad8','Numpad9','NumpadAdd'],
  ['Numpad4','Numpad5','Numpad6','NumpadAdd'],
  ['Numpad1','Numpad2','Numpad3','NumpadEnter'],
  ['Numpad0',null,'NumpadDecimal','NumpadEnter']
];
export const KEY_LAYOUT = [
  ...KEY_ROWS.flatMap((row,r)=>row.flatMap((code,c)=>code?[{
    code,x:-1.58+c*.194,z:-.44+r*.176,scale:[.94,1,.91]
  }]:[])),
  ...NUMPAD_ROWS.flatMap((row,r)=>row.flatMap((code,c)=>code?[{
    code,
    x:1.49+c*.172+(r===4&&c===0?.086:0),
    z:-.40+r*.177,
    scale:[r===4&&c===0?1.98:.88,1,.91]
  }]:[]))
];
