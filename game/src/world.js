// Dapur Kilat — kitchen state and the cooking loop: stations, heat,
// flips, pours, rush waves and the shift clock. Rendering never lives here.
function newWorld() {
  return {
    phase: 'title', // title | playing | over
    elapsed: 0,
    timeLeft: DK.SHIFT_SECONDS,
    score: 0,
    coins: 0,
    served: 0,
    perfectServes: 0,
    combo: 0,
    comboTimer: 0,
    lastServeAt: -99,
    orders: [],
    activeOrderId: 0,
    spawnTimer: 2.5,
    rushTimer: 0,
    rushCount: 0,
    rushBanner: 0,
    // Per-station live state, reset when a step completes.
    stations: {
      chop: { progress: 0, hits: 0, knife: 0 },
      wok: { heat: 0.5, progress: 0, burnt: 0, steam: 0 },
      grill: { progress: 0, flipped: false, flipWindow: false, sizzle: 0 },
      pour: { level: 0, holding: false, spilled: false }
    },
    plate: null, // { dishId, name, color } when a dish is plated and ready
    chef: { station: 'chop', x: 432, tx: 432 },
    toast: null, // { text, until }
    flash: 0, // red flash timer on a mistake
    frozen: false, // shots freeze the world so a screenshot is stable
    shotT: 0, // fixed clock for staged scenes
    rng: Math.random,
    muted: false
  };
}

// The station the active order's next step needs, or null.
function currentStation(world) {
  const order = activeOrder(world);
  if (!order) return null;
  const step = nextStep(order);
  if (!step) return 'plating';
  return stationForStep(step);
}

// Show a short toast under the HUD.
function setToast(world, text, seconds) {
  world.toast = { text: text, until: world.elapsed + (seconds || 2) };
}

// Start the shift: clear the board, deal two opening tickets.
function startShift(world) {
  world.phase = 'playing';
  world.elapsed = 0;
  world.timeLeft = DK.SHIFT_SECONDS;
  world.score = 0;
  world.coins = 0;
  world.served = 0;
  world.perfectServes = 0;
  world.combo = 0;
  world.comboTimer = 0;
  world.orders = [];
  world.activeOrderId = 0;
  world.spawnTimer = 6;
  world.rushTimer = 0;
  world.rushCount = 0;
  world.plate = null;
  resetStations(world);
  spawnOrder(world, 'nasiGoreng', false);
  spawnOrder(world, 'mieAyam', false);
  autoSelect(world);
  setToast(world, 'Shift dimulai! Layani pesanan sebelum pelanggan kabur.', 3);
}

function resetStations(world) {
  world.stations.chop = { progress: 0, hits: 0, knife: 0 };
  world.stations.wok = { heat: 0.5, progress: 0, burnt: 0, steam: 0 };
  world.stations.grill = { progress: 0, flipped: false, flipWindow: false, sizzle: 0 };
  world.stations.pour = { level: 0, holding: false, spilled: false };
}

// Work the named station once (a click or Space). Returns a short note.
function workStation(world, stationId) {
  if (world.phase !== 'playing' || world.frozen) return '';
  const order = activeOrder(world);
  if (!order) { setToast(world, 'Pilih pesanan dulu — klik tiket di papan.', 2); return 'no-order'; }
  const step = nextStep(order);
  if (!step) {
    // Dish is plated: any station tap is a nudge to serve.
    return 'serve-ready';
  }
  const need = stationForStep(step);
  if (stationId !== need) {
    order.perfect = false;
    world.flash = 0.25;
    Sound.error();
    setToast(world, 'Bukan stasiunnya! ' + step.label + ' di ' + stationName(need) + '.', 1.6);
    return 'wrong-station';
  }
  world.chef.station = stationId;
  const st = world.stations[stationId];
  if (stationId === 'chop') {
    st.hits += 1;
    st.knife = 0.18;
    Sound.chop();
    step.done = Math.min(step.need, st.hits);
    if (st.hits >= step.need) completeStep(world, order, step);
    return 'chop';
  }
  if (stationId === 'wok') {
    // Stirring pulls the heat back toward the sweet middle.
    st.heat += (0.55 - st.heat) * 0.45;
    Sound.stir();
    return 'stir';
  }
  if (stationId === 'grill') {
    if (st.flipWindow && !st.flipped) {
      st.flipped = true;
      st.flipWindow = false;
      Sound.flip();
      setToast(world, 'Balik sempurna! +bonus', 1.2);
      return 'flip';
    }
    Sound.click();
    return 'grill-wait';
  }
  if (stationId === 'pour') {
    st.holding = true;
    return 'pour-hold';
  }
  return '';
}

function stationName(id) {
  if (id === 'chop') return 'TALENAN';
  if (id === 'wok') return 'WOK';
  if (id === 'grill') return 'PANGGANGAN';
  if (id === 'pour') return 'ES TEH';
  return 'PIRING SAJI';
}

// A step is finished: clear its station, advance, and plate when done.
function completeStep(world, order, step) {
  const st = world.stations[stationForStep(step)];
  if (st) {
    if (step.kind === 'chop') { st.hits = 0; st.progress = 0; }
    if (step.kind === 'wok') { st.progress = 0; st.heat = 0.5; }
    if (step.kind === 'grill') { st.progress = 0; st.flipped = false; st.flipWindow = false; }
    if (step.kind === 'pour') { st.level = 0; st.holding = false; st.spilled = false; }
  }
  if (!nextStep(order)) {
    world.plate = { dishId: order.dishId, name: order.name, color: order.color };
    order.state = 'ready';
    Sound.ding();
    setToast(world, order.name + ' siap! Klik piring / tombol SAJIKAN.', 2.5);
  } else {
    Sound.click();
  }
}

// Hold-to-pour: called every frame while the mouse is down on ES TEH.
function tickPour(world, dt, holding) {
  const st = world.stations.pour;
  const order = activeOrder(world);
  if (!order) return;
  const step = nextStep(order);
  if (!step || step.kind !== 'pour') return;
  st.holding = holding;
  if (!holding) return;
  st.level += dt * 55;
  if (Math.floor(st.level / 20) !== Math.floor((st.level - dt * 55) / 20)) Sound.pour();
  if (st.level >= 100) {
    if (st.level > 108) {
      // Over-poured: the glass spills, pour again from half.
      st.level = 45;
      st.spilled = true;
      order.perfect = false;
      Sound.error();
      setToast(world, 'Tumpah! Tuang lagi, jangan sampai penuh.', 1.8);
    } else {
      step.done = step.need;
      completeStep(world, order, step);
    }
  }
}

// Per-frame update while playing: clock, spawning, rush, stations, orders.
function tickWorld(world, dt) {
  if (world.phase !== 'playing' || world.frozen) return;
  world.elapsed += dt;
  world.timeLeft = Math.max(0, DK.SHIFT_SECONDS - world.elapsed);
  if (world.timeLeft <= 0) {
    world.phase = 'over';
    Sound.over();
    return;
  }
  if (world.comboTimer > 0) {
    world.comboTimer -= dt;
    if (world.comboTimer <= 0) world.combo = 0;
  }
  if (world.rushBanner > 0) world.rushBanner -= dt;
  if (world.flash > 0) world.flash -= dt;
  if (world.toast && world.elapsed > world.toast.until) world.toast = null;

  // Rush waves: banner, two impatient tickets, faster patience drain.
  for (let i = 0; i < DK.RUSH_AT.length; i++) {
    if (world.elapsed >= DK.RUSH_AT[i] && world.rushCount === i) {
      world.rushCount += 1;
      world.rushTimer = DK.RUSH_LENGTH;
      world.rushBanner = 3;
      Sound.rush();
      setToast(world, 'RUSH! Pelanggan berdatangan — sabar mereka cepat habis!', 3);
      spawnOrder(world, null, true);
      spawnOrder(world, null, true);
    }
  }
  if (world.rushTimer > 0) world.rushTimer -= dt;

  // New tickets trickle in while the board has room.
  world.spawnTimer -= dt;
  if (world.spawnTimer <= 0) {
    spawnOrder(world, null, false);
    world.spawnTimer = 9 + Math.random() * 5;
  }

  // Wok: heat wanders; progress only grows in the green band.
  const order = activeOrder(world);
  const step = order ? nextStep(order) : null;
  const wok = world.stations.wok;
  if (step && step.kind === 'wok') {
    wok.heat += Math.sin(world.elapsed * 2.2) * 0.0035 + (Math.random() - 0.5) * 0.006;
    wok.heat = Math.max(0.05, Math.min(0.98, wok.heat));
    wok.steam += dt;
    if (wok.heat >= 0.35 && wok.heat <= 0.78) {
      step.done = Math.min(step.need, step.done + dt * 34);
      if (step.done >= step.need) completeStep(world, order, step);
    } else if (wok.heat > 0.92) {
      wok.burnt += dt;
      if (wok.burnt > 1.2) {
        wok.burnt = 0;
        step.done = Math.max(0, step.done - 30);
        order.perfect = false;
        Sound.alarm();
        setToast(world, 'Gosong! Aduk terus, jaga api di zona hijau.', 2);
      }
    } else {
      wok.burnt = 0;
    }
  }

  // Grill: fills on its own; a flip window opens halfway.
  const grill = world.stations.grill;
  if (step && step.kind === 'grill') {
    grill.progress += dt * 26;
    grill.sizzle += dt;
    if (grill.progress >= 50 && grill.progress < 78 && !grill.flipped) grill.flipWindow = true;
    if (grill.progress >= 78 && !grill.flipped) {
      grill.flipWindow = false;
      grill.progress = 60;
      order.perfect = false;
      setToast(world, 'Sate hampir gosong — klik PANGGANGAN untuk balik!', 1.8);
    }
    if (grill.progress >= 100) {
      step.done = step.need;
      completeStep(world, order, step);
    }
  }

  // Chop knife animation decay.
  const chop = world.stations.chop;
  if (chop.knife > 0) chop.knife -= dt;

  // Chef walks toward the station the current step needs.
  const target = currentStation(world);
  if (target && target !== 'plating') {
    const slot = DK.STATIONS.find(function (s) { return s.id === target; });
    if (slot) world.chef.tx = slot.x + slot.w / 2;
  }
  world.chef.x += (world.chef.tx - world.chef.x) * Math.min(1, dt * 6);

  // Patience and expiry.
  const expired = tickOrders(world, dt);
  for (let i = 0; i < expired.length; i++) {
    world.combo = 0;
    Sound.alarm();
    setToast(world, 'Pelanggan kabur! ' + expired[i].name + ' tidak terlayani.', 2.2);
  }
  autoSelect(world);
}
