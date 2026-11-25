// Dapur Kilat — boot and main loop. Reads ?shot=…&seed=… for staged
// scenes, otherwise opens on the title screen and runs the shift.
(function bootDapurKilat() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const world = newWorld();

  // Staged scene? Freeze the world on a deterministic setup.
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const seed = Number(params.get('seed') || '1');
  if (shot) {
    applyShot(world, shot, seed);
  }

  bindInput(canvas, world);

  let last = performance.now();
  function frame(now) {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.05) dt = 0.05;
    if (dt < 0) dt = 0;
    // Hold-to-pour needs a per-frame tick while the mouse is down.
    if (world.phase === 'playing' && !world.frozen && world.pourHeld && world.pourHeld()) {
      tickPour(world, dt, true);
    }
    tickWorld(world, dt);
    ctx.clearRect(0, 0, DK.W, DK.H);
    renderGame(ctx, world);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // Expose the world for debugging from the console.
  window.__dapurKilat = world;
})();
