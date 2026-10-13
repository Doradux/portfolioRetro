// MouseEvent emits one mousedown/mouseup per button, unlike PointerEvent,
// whose down/up lifecycle represents the whole active pointer (and therefore
// loses extra presses/releases when both mouse buttons are held).
export function createMouseButtonTracker(onPress, onRelease) {
  const pressed = new Set();
  const buttonMasks = [[0, 1], [2, 2]];

  function press(button) {
    if (button !== 0 && button !== 2) return;
    if (pressed.has(button)) return;
    pressed.add(button);
    onPress(button);
  }
  function release(button) {
    if (!pressed.delete(button)) return;
    onRelease(button);
  }

  // MouseEvent.buttons is the *current* bitfield, so movement and releases
  // automatically repair missed transitions when the browser regains focus.
  function synchronize(buttons) {
    if (typeof buttons !== 'number') return;
    for (const [button, mask] of buttonMasks) {
      if ((buttons & mask) !== 0) press(button);
      else release(button);
    }
  }
  return {
    pressed,
    onMouseDown(event) {
      press(event.button);
      synchronize(event.buttons);
    },
    onMouseUp(event) {
      release(event.button);
      synchronize(event.buttons);
    },
    onMouseMove(event) { synchronize(event.buttons); },
    // Lost focus / pointer leaving browser: immediately restore the
    // physical buttons, but never invent a release sound without a mouseup.
    reset() { pressed.clear(); },
  };
}
