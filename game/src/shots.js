// Dapur Kilat — deterministic staged scenes for screenshots.
// ?shot=start|play|rush|serve&seed=1 sets up a complete, lively kitchen
// with no input needed, then freezes the world so the render is stable.
function applyShot(world, name, seed) {
  const rng = makeSeededRandom(seed || 1);
  world.rng = rng;
  world.frozen = true;
  world.shotT = 4.2;
  world.phase = 'playing';
  world.orders = [];
  world.plate = null;
  resetStations(world);
  world.toast = null;
  world.flash = 0;
  world.rushBanner = 0;

  if (name === 'start') {
    // Opening moment: two tickets, fresh timer, ingredients out.
    world.elapsed = 0;
    world.timeLeft = 180;
    world.score = 0;
    world.coins = 0;
    world.served = 0;
    world.combo = 0;
    spawnOrder(world, 'nasiGoreng', false);
    spawnOrder(world, 'mieAyam', false);
    world.orders[0].patience = 0.92;
    world.orders[1].patience = 0.85;
    world.activeOrderId = world.orders[0].id;
    world.chef.x = 432;
    world.chef.tx = 432;
    world.chef.station = 'chop';
    world.toast = { text: 'Shift dimulai! Layani pesanan sebelum pelanggan kabur.', until: 99 };
    return;
  }

  if (name === 'play') {
    // Mid-service: bawang done, wok mid-cook in the green zone.
    world.elapsed = 64;
    world.timeLeft = 116;
    world.score = 480;
    world.coins = 43000;
    world.served = 3;
    world.combo = 2;
    world.comboTimer = 6;
    spawnOrder(world, 'nasiGoreng', false);
    spawnOrder(world, 'mieAyam', false);
    spawnOrder(world, 'sateAyam', false);
    world.orders[0].patience = 0.72;
    world.orders[1].patience = 0.58;
    world.orders[2].patience = 0.81;
    world.activeOrderId = world.orders[0].id;
    world.orders[0].steps[0].done = 3; // bawang sudah selesai dipotong
    world.orders[0].steps[1].done = 40; // nasi goreng sedang ditumis
    world.stations.chop.hits = 3;
    world.stations.wok.heat = 0.55;
    world.stations.wok.progress = 40;
    world.chef.x = 672;
    world.chef.tx = 672;
    world.chef.station = 'wok';
    return;
  }

  if (name === 'rush') {
    // Service rush: three tickets, two low on patience, everything busy.
    world.elapsed = 121;
    world.timeLeft = 59;
    world.score = 1240;
    world.coins = 98000;
    world.served = 8;
    world.combo = 3;
    world.comboTimer = 8;
    world.rushTimer = 12;
    world.rushBanner = 2;
    spawnOrder(world, 'sateAyam', true);
    spawnOrder(world, 'nasiGoreng', true);
    spawnOrder(world, 'esTeh', true);
    world.orders[0].patience = 0.28;
    world.orders[1].patience = 0.41;
    world.orders[2].patience = 0.63;
    world.activeOrderId = world.orders[0].id;
    const step = nextStep(world.orders[0]);
    if (step) step.done = 1; // sate: ayam 1/2 potong
    world.stations.chop.hits = 1;
    world.stations.wok.heat = 0.62;
    world.stations.pour.level = 40;
    world.chef.x = 860;
    world.chef.tx = 860;
    world.chef.station = 'grill';
    return;
  }

  // serve: a finished dish on the plate, ready to go out.
  world.elapsed = 96;
  world.timeLeft = 84;
  world.score = 960;
  world.coins = 76000;
  world.served = 6;
  world.combo = 2;
  world.comboTimer = 7;
  spawnOrder(world, 'mieAyam', false);
  spawnOrder(world, 'esTeh', false);
  world.orders[0].patience = 0.66;
  world.orders[1].patience = 0.88;
  world.activeOrderId = world.orders[0].id;
  const served = world.orders[0];
  for (let i = 0; i < served.steps.length; i++) served.steps[i].done = served.steps[i].need;
  served.state = 'ready';
  world.plate = { dishId: 'mieAyam', name: 'Mie Ayam', color: '#f2c14e' };
  world.stations.pour.level = 55;
  world.chef.x = 600;
  world.chef.tx = 600;
  world.chef.station = 'wok';
  world.toast = { text: 'Mie Ayam siap! Klik piring / tombol SAJIKAN.', until: 99 };
}
