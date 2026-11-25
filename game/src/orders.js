// Dapur Kilat — order tickets: spawning, patience, serving, expiry.
// An order is one customer's ticket on the board. Its steps come from the
// recipe; patience drains in real time and faster during a rush.
let orderSeq = 0;

function makeOrder(dishId, patienceSeconds, rng) {
  const recipe = RECIPES[dishId];
  orderSeq += 1;
  return {
    id: orderSeq,
    dishId: dishId,
    name: recipe.name,
    color: recipe.color,
    price: recipe.price,
    steps: recipe.steps.map(function (s) {
      return { kind: s.kind, label: s.label, need: s.need, ingredient: s.ingredient, done: 0 };
    }),
    patience: 1,
    maxPatience: patienceSeconds,
    state: 'waiting', // waiting | active | ready | served | expired
    bornAt: 0,
    perfect: true,
    rng: rng || null
  };
}

// The next step of an order that is not finished yet, or null.
function nextStep(order) {
  for (let i = 0; i < order.steps.length; i++) {
    if (order.steps[i].done < order.steps[i].need) return order.steps[i];
  }
  return null;
}

// True when every step is done and the dish sits on the plate.
function orderReady(order) {
  return nextStep(order) === null;
}

// Spawn a ticket. Patience is drawn from the shift tuning; rush tickets
// arrive a little more impatient.
function spawnOrder(world, dishId, impatient) {
  if (world.orders.length >= DK.MAX_ORDERS) return null;
  const rng = world.rng || Math.random;
  const dish = dishId || MENU[Math.floor(rng() * MENU.length)];
  let seconds = DK.PATIENCE_MIN + rng() * (DK.PATIENCE_MAX - DK.PATIENCE_MIN);
  if (impatient) seconds *= 0.8;
  const order = makeOrder(dish, seconds, rng);
  order.bornAt = world.elapsed;
  world.orders.push(order);
  return order;
}

// Drain patience; expire tickets that hit zero. Returns expired orders.
function tickOrders(world, dt) {
  const expired = [];
  const drain = world.rushTimer > 0 ? DK.RUSH_DRAIN : 1;
  for (let i = world.orders.length - 1; i >= 0; i--) {
    const order = world.orders[i];
    if (order.state === 'served' || order.state === 'expired') continue;
    order.patience -= dt * drain / order.maxPatience;
    if (order.patience <= 0) {
      order.patience = 0;
      order.state = 'expired';
      expired.push(order);
      world.orders.splice(i, 1);
      if (world.activeOrderId === order.id) world.activeOrderId = 0;
    }
  }
  return expired;
}

// Score for serving an order: base + patience left + combo step + perfect.
function scoreServe(world, order) {
  let points = DK.SCORE_BASE;
  points += Math.round(order.patience * DK.SCORE_PATIENCE_BONUS);
  if (order.perfect) points += DK.SCORE_PERFECT;
  const comboBonus = world.combo * DK.COMBO_STEP;
  return points + comboBonus;
}

// Serve the active order when its dish is ready. Returns points or 0.
function serveOrder(world) {
  const order = activeOrder(world);
  if (!order || !orderReady(order)) return 0;
  const points = scoreServe(world, order);
  order.state = 'served';
  world.score += points;
  world.coins += order.price;
  world.served += 1;
  if (order.perfect) world.perfectServes += 1;
  world.orders = world.orders.filter(function (o) { return o.id !== order.id; });
  world.activeOrderId = 0;
  world.plate = null;
  world.combo += 1;
  world.comboTimer = DK.COMBO_WINDOW;
  world.lastServeAt = world.elapsed;
  return points;
}

// The order the player is currently cooking for.
function activeOrder(world) {
  for (let i = 0; i < world.orders.length; i++) {
    if (world.orders[i].id === world.activeOrderId) return world.orders[i];
  }
  return null;
}

// Pick the first waiting ticket when nothing is selected.
function autoSelect(world) {
  if (world.activeOrderId) return;
  if (world.orders.length) world.activeOrderId = world.orders[0].id;
}
