// Dapur Kilat — mouse and keyboard input. Clicks are mapped to canvas
// pixels; keys 1-4 pick a station, Space works it or serves, R restarts.
function canvasPos(canvas, ev) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (ev.clientX - rect.left) * (DK.W / rect.width),
    y: (ev.clientY - rect.top) * (DK.H / rect.height)
  };
}

function inside(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

// Which ticket card (if any) sits under the point.
function ticketAt(world, px, py) {
  const board = DK.LAYOUT.board;
  for (let i = 0; i < world.orders.length; i++) {
    const r = { x: board.x + 12, y: board.y + DK.TICKET.y0 + i * DK.TICKET.step, w: board.w - 24, h: DK.TICKET.h };
    if (inside(px, py, r)) return world.orders[i];
  }
  return null;
}

function stationAt(px, py) {
  for (let i = 0; i < DK.STATIONS.length; i++) {
    const s = DK.STATIONS[i];
    if (inside(px, py, s)) return s.id;
  }
  return null;
}

function bindInput(canvas, world) {
  let pourDown = false;

  function pressStation(id) {
    const note = workStation(world, id);
    if (note === 'serve-ready') tryServe(world);
  }

  function tryServe(world) {
    const order = activeOrder(world);
    if (!order) return;
    if (!orderReady(order)) {
      setToast(world, 'Belum siap — selesaikan langkah ' + (nextStep(order) ? nextStep(order).label : '') + ' dulu.', 1.8);
      Sound.error();
      return;
    }
    const points = serveOrder(world);
    if (points > 0) {
      Sound.serve();
      setToast(world, 'Tersaji! +' + points + ' poin' + (world.combo > 1 ? ' — kombo x' + world.combo : ''), 2);
    }
  }

  canvas.addEventListener('mousedown', function (ev) {
    Sound.ensure();
    const p = canvasPos(canvas, ev);
    if (world.phase === 'title') { startShift(world); Sound.click(); return; }
    if (world.phase === 'over') { startShift(world); Sound.click(); return; }
    if (world.frozen) return;

    const ticket = ticketAt(world, p.x, p.y);
    if (ticket) {
      world.activeOrderId = ticket.id;
      Sound.click();
      return;
    }
    if (inside(p.x, p.y, DK.SERVE)) { tryServe(world); return; }
    const plating = DK.LAYOUT.plating;
    if (inside(p.x, p.y, plating) && world.plate) { tryServe(world); return; }
    const station = stationAt(p.x, p.y);
    if (station) {
      if (station === 'pour') pourDown = true;
      pressStation(station);
      return;
    }
  });

  window.addEventListener('mouseup', function () {
    pourDown = false;
    world.stations.pour.holding = false;
  });

  // The pour station fills while the mouse is held down on it.
  canvas.addEventListener('mousemove', function (ev) {
    if (!pourDown) return;
    const p = canvasPos(canvas, ev);
    if (stationAt(p.x, p.y) !== 'pour') return;
    tickPour(world, 1 / 60, true);
  });

  window.addEventListener('keydown', function (ev) {
    if (ev.repeat) return;
    Sound.ensure();
    if (ev.key === 'm' || ev.key === 'M') {
      world.muted = Sound.toggleMute();
      return;
    }
    if (world.phase === 'title' || world.phase === 'over') {
      if (ev.key === 'Enter' || ev.key === ' ') { startShift(world); ev.preventDefault(); }
      return;
    }
    if (world.frozen) return;
    if (ev.key >= '1' && ev.key <= '4') {
      pressStation(DK.STATIONS[Number(ev.key) - 1].id);
      return;
    }
    if (ev.key === ' ') {
      const station = currentStation(world);
      if (station === 'plating') tryServe(world);
      else if (station) pressStation(station);
      ev.preventDefault();
      return;
    }
    if (ev.key === 'r' || ev.key === 'R') startShift(world);
  });

  // Expose the pour state for the main loop (hold-to-pour needs per-frame ticks).
  world.pourHeld = function () { return pourDown; };
}
