import assert from 'node:assert/strict';
import { createMouseButtonTracker } from '../src/lib/mouseButtonTracker.js';

function make() {
  const actions = [];
  const tracker = createMouseButtonTracker(
    button => actions.push('down:' + button),
    button => actions.push('up:' + button)
  );
  return {tracker, actions};
}

{
  const {tracker,actions} = make();
  tracker.onMouseDown({button:0,buttons:1});
  tracker.onMouseDown({button:2,buttons:3});
  assert.deepEqual([...tracker.pressed].sort(),[0,2]);
  assert.deepEqual(actions,['down:0','down:2']);
  tracker.onMouseUp({button:0,buttons:2});
  assert.deepEqual([...tracker.pressed],[2], 'right remains held');
  tracker.onMouseUp({button:2,buttons:0});
  assert.deepEqual(actions,['down:0','down:2','up:0','up:2']);
  assert.equal(tracker.pressed.size,0);
}

{
  const {tracker,actions} = make();
  tracker.onMouseDown({button:2,buttons:2});
  tracker.onMouseDown({button:0,buttons:3});
  assert.deepEqual([...tracker.pressed].sort(),[0,2]);
  tracker.onMouseUp({button:2,buttons:1});
  assert.deepEqual([...tracker.pressed],[0],'left remains held');
  tracker.onMouseUp({button:0,buttons:0});
  assert.deepEqual(actions,['down:2','down:0','up:2','up:0']);
}

{
  const {tracker,actions} = make();
  tracker.onMouseDown({button:0,buttons:1});
  tracker.onMouseDown({button:0,buttons:1});
  tracker.onMouseDown({button:2,buttons:3});
  tracker.onMouseMove({buttons:3});
  tracker.onMouseMove({buttons:2}); // Recover a missed left release.
  tracker.onMouseMove({buttons:0}); // Recover a missed right release.
  assert.deepEqual(actions,['down:0','down:2','up:0','up:2']);
  assert.equal(tracker.pressed.size,0);
}
{
  const {tracker,actions} = make();
  tracker.onMouseDown({button:0,buttons:1});
  tracker.onMouseDown({button:2,buttons:3});
  tracker.reset(); // Blur/outside viewport should never leave keys visually depressed.
  assert.equal(tracker.pressed.size,0);
  assert.deepEqual(actions,['down:0','down:2'],'do not invent releases on blur');
  tracker.onMouseMove({buttons:0});
  assert.deepEqual(actions,['down:0','down:2']);
  tracker.onMouseDown({button:0,buttons:1});
  tracker.onMouseUp({button:0,buttons:0});
  assert.deepEqual(actions,['down:0','down:2','down:0','up:0']);
}
console.log('PASS: left+right and right+left chords, individual releases, missed mouseups and blur recovery');
