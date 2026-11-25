// Dapur Kilat — every pixel the game draws. Canvas 2D, flat colours,
// big labels, high contrast: the screenshots must read at a glance.
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function tNow(world) {
  return world.frozen ? world.shotT : world.elapsed;
}

function fmtTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return String(Math.floor(s / 60)) + ':' + String(s % 60).padStart(2, '0');
}

function fmtRp(n) {
  return 'Rp' + n.toLocaleString('id-ID');
}

// ---- food drawing: one dish, centred at (cx, cy), scale s ----
function drawDish(ctx, dishId, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(s, s);
  if (dishId === 'nasiGoreng') {
    // Mound of orange fried rice with a fried egg on top.
    ctx.fillStyle = '#e8862e';
    ctx.beginPath(); ctx.arc(0, 6, 34, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#f2a541';
    ctx.beginPath(); ctx.arc(-12, -2, 8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(10, 2, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff6e0';
    ctx.beginPath(); ctx.ellipse(2, -14, 20, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath(); ctx.arc(2, -14, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2e9e5b';
    ctx.fillRect(-26, -4, 8, 3); ctx.fillRect(16, -8, 8, 3);
    ctx.fillStyle = '#d63a2f';
    ctx.fillRect(-4, 8, 10, 4);
  } else if (dishId === 'mieAyam') {
    // Yellow noodle swirls with chicken chunks.
    ctx.strokeStyle = '#f2c14e';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(-14 + i * 14, 4 + (i % 2) * 4, 11, 0.3, Math.PI * 1.7);
      ctx.stroke();
    }
    ctx.fillStyle = '#c98a2e';
    ctx.fillRect(-24, -16, 12, 10);
    ctx.fillRect(4, -20, 12, 10);
    ctx.fillRect(14, -8, 12, 10);
    ctx.fillStyle = '#2e9e5b';
    ctx.fillRect(-8, -12, 14, 4);
    ctx.fillRect(-18, 10, 12, 4);
  } else if (dishId === 'sateAyam') {
    // Two skewers of grilled chicken with peanut sauce.
    ctx.strokeStyle = '#8a5a33';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-34, -12); ctx.lineTo(34, -12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-34, 10); ctx.lineTo(34, 10); ctx.stroke();
    ctx.fillStyle = '#8a4a1e';
    const cubes = [[-24, -12], [-6, -12], [12, -12], [-16, 10], [4, 10], [22, 10]];
    for (let i = 0; i < cubes.length; i++) {
      ctx.fillRect(cubes[i][0] - 6, cubes[i][1] - 6, 12, 12);
    }
    ctx.fillStyle = '#d98a3a';
    ctx.beginPath(); ctx.ellipse(0, 26, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
  } else if (dishId === 'esTeh') {
    // Tall glass of iced tea with a straw.
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.85;
    rr(ctx, -14, -28, 28, 56, 5); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#c96a1e';
    rr(ctx, -11, -14, 22, 39, 4); ctx.fill();
    ctx.fillStyle = '#e8a13a';
    rr(ctx, -11, -14, 22, 10, 4); ctx.fill();
    ctx.fillStyle = '#dff2fb';
    ctx.fillRect(-8, -20, 8, 8);
    ctx.fillRect(2, -8, 8, 8);
    ctx.strokeStyle = '#d63a2f';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(8, -30); ctx.lineTo(16, -44); ctx.stroke();
  }
  ctx.restore();
}

// ---- background: wall, window, floor, hanging sign ----
function drawBackground(ctx, world) {
  const C = DK.COLORS;
  ctx.fillStyle = C.wall;
  ctx.fillRect(0, 0, DK.W, DK.H);
  ctx.fillStyle = C.wallBand;
  ctx.fillRect(0, 64, DK.W, 10);
  // Floor.
  ctx.fillStyle = C.floor;
  ctx.fillRect(0, 748, DK.W, 52);
  ctx.fillStyle = C.floorLine;
  for (let x = 0; x < DK.W; x += 80) ctx.fillRect(x, 748, 3, 52);
  // Hanging sign.
  ctx.fillStyle = C.hud;
  rr(ctx, 16, 556, 280, 44, 8); ctx.fill();
  ctx.fillStyle = C.hudText;
  ctx.font = 'bold 17px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WARUNG KILAT • SEJAK 1998', 156, 585);
}

// ---- HUD: title, shift timer, score, coins, combo ----
function drawHUD(ctx, world) {
  const C = DK.COLORS;
  const h = DK.LAYOUT.hud;
  ctx.fillStyle = C.hud;
  ctx.fillRect(h.x, h.y, h.w, h.h);
  ctx.textAlign = 'left';
  ctx.fillStyle = C.gold;
  ctx.font = 'bold 30px "Trebuchet MS", sans-serif';
  ctx.fillText('DAPUR KILAT', 20, 42);
  ctx.fillStyle = C.hudText;
  ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
  ctx.fillText('warung cepat saji', 240, 40);
  // Shift timer, big and centred.
  const low = world.timeLeft <= 30 && world.phase === 'playing';
  ctx.textAlign = 'center';
  ctx.fillStyle = low ? '#ff6b5e' : C.hudText;
  ctx.font = 'bold 40px "Trebuchet MS", sans-serif';
  ctx.fillText('⏱ ' + fmtTime(world.timeLeft), 640, 46);
  ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
  ctx.fillStyle = C.hudText;
  ctx.fillText('SHIFT', 640, 60);
  // Score / coins / combo, right side.
  ctx.textAlign = 'right';
  ctx.fillStyle = C.hudText;
  ctx.font = 'bold 24px "Trebuchet MS", sans-serif';
  ctx.fillText('SKOR ' + world.score, 1000, 30);
  ctx.font = 'bold 18px "Trebuchet MS", sans-serif';
  ctx.fillText(fmtRp(world.coins), 1000, 54);
  if (world.combo >= 2) {
    ctx.fillStyle = C.gold;
    ctx.font = 'bold 24px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('KOMBO x' + world.combo, 1060, 30);
  }
  if (world.rushTimer > 0) {
    ctx.fillStyle = '#ff6b5e';
    ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('RUSH!', 1060, 58);
  }
}

// ---- order board with tickets ----
function drawBoard(ctx, world) {
  const C = DK.COLORS;
  const b = DK.LAYOUT.board;
  ctx.fillStyle = C.board;
  rr(ctx, b.x, b.y, b.w, b.h, 12); ctx.fill();
  ctx.strokeStyle = C.boardEdge;
  ctx.lineWidth = 3;
  rr(ctx, b.x, b.y, b.w, b.h, 12); ctx.stroke();
  ctx.fillStyle = C.hudText;
  ctx.font = 'bold 24px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('PESANAN', b.x + 16, b.y + 34);
  ctx.font = 'bold 14px "Trebuchet MS", sans-serif';
  ctx.fillStyle = '#c9a86a';
  ctx.fillText(world.orders.length + ' / ' + DK.MAX_ORDERS + ' pelanggan', b.x + 150, b.y + 33);
  if (!world.orders.length) {
    ctx.fillStyle = '#c9a86a';
    ctx.font = 'bold 18px "Trebuchet MS", sans-serif';
    ctx.fillText('Belum ada pesanan…', b.x + 20, b.y + 120);
  }
  for (let i = 0; i < world.orders.length; i++) {
    drawTicket(ctx, world, world.orders[i], b.x + 12, b.y + DK.TICKET.y0 + i * DK.TICKET.step);
  }
}

function drawTicket(ctx, world, order, x, y) {
  const C = DK.COLORS;
  const w = DK.LAYOUT.board.w - 24;
  const h = DK.TICKET.h;
  const active = world.activeOrderId === order.id;
  const ready = orderReady(order);
  ctx.fillStyle = C.ticket;
  rr(ctx, x, y, w, h, 10); ctx.fill();
  ctx.lineWidth = active ? 4 : 2;
  ctx.strokeStyle = ready ? C.good : (active ? C.gold : C.ticketEdge);
  rr(ctx, x, y, w, h, 10); ctx.stroke();
  // Dish colour tab + name.
  ctx.fillStyle = order.color;
  rr(ctx, x, y, 10, h, 5); ctx.fill();
  ctx.fillStyle = C.textDark;
  ctx.font = 'bold 24px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(order.name, x + 22, y + 32);
  ctx.fillStyle = C.textMuted;
  ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(fmtRp(order.price), x + w - 12, y + 30);
  ctx.textAlign = 'left';
  // Step chips.
  for (let i = 0; i < order.steps.length; i++) {
    const st = order.steps[i];
    const cx = x + 22 + i * 78;
    const done = st.done >= st.need;
    const current = !done && (i === 0 || order.steps[i - 1].done >= order.steps[i - 1].need);
    ctx.fillStyle = done ? C.good : (current ? C.warn : '#d9c9a8');
    rr(ctx, cx, y + 46, 76, 26, 6); ctx.fill();
    ctx.fillStyle = done ? '#ffffff' : C.textDark;
    ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
    ctx.fillText((done ? '✓ ' : '') + stepVerb(st.kind), cx + 7, y + 64);
  }
  // Patience bar.
  const barY = y + 88;
  ctx.fillStyle = '#e8dcc0';
  rr(ctx, x + 22, barY, w - 44, 16, 8); ctx.fill();
  const pColor = order.patience > 0.5 ? C.good : (order.patience > 0.25 ? C.warn : C.bad);
  ctx.fillStyle = pColor;
  if (order.patience > 0.01) {
    rr(ctx, x + 22, barY, Math.max(18, (w - 44) * order.patience), 16, 8); ctx.fill();
  }
  ctx.fillStyle = C.textMuted;
  ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
  ctx.fillText('SABAR', x + 22, barY + 30);
  if (ready) {
    ctx.fillStyle = C.good;
    ctx.font = 'bold 18px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('SIAP DISAJIKAN!', x + w - 12, barY + 30);
    ctx.textAlign = 'left';
  } else if (active) {
    ctx.fillStyle = C.accent;
    ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'right';
    const step = nextStep(order);
    ctx.fillText('▶ ' + (step ? step.label : ''), x + w - 12, barY + 30);
    ctx.textAlign = 'left';
  }
}

// ---- ingredient bins on the counter ----
function drawBins(ctx) {
  const C = DK.COLORS;
  const b = DK.LAYOUT.bins;
  ctx.fillStyle = C.counterTop;
  rr(ctx, b.x, b.y, b.w, b.h, 10); ctx.fill();
  ctx.fillStyle = C.textDark;
  ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('BAHAN DI MEJA:', b.x + 12, b.y + 22);
  const bw = (b.w - 24) / DK.BINS.length;
  for (let i = 0; i < DK.BINS.length; i++) {
    const bin = DK.BINS[i];
    const cx = b.x + 12 + i * bw + bw / 2;
    ctx.fillStyle = '#fff6e0';
    ctx.beginPath(); ctx.ellipse(cx, b.y + 52, 44, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = bin.color;
    ctx.beginPath(); ctx.ellipse(cx, b.y + 48, 36, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = bin.dot;
    ctx.beginPath(); ctx.arc(cx - 10, b.y + 46, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 8, b.y + 50, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.textDark;
    ctx.font = 'bold 14px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(bin.name, cx, b.y + 78);
  }
  ctx.textAlign = 'left';
}

// ---- stations ----
function drawStations(ctx, world) {
  const current = currentStation(world);
  for (let i = 0; i < DK.STATIONS.length; i++) {
    drawStation(ctx, world, DK.STATIONS[i], current === DK.STATIONS[i].id);
  }
}

function drawStation(ctx, world, slot, isCurrent) {
  const C = DK.COLORS;
  const st = world.stations[slot.id];
  ctx.fillStyle = C.station;
  rr(ctx, slot.x, slot.y, slot.w, slot.h, 12); ctx.fill();
  // Header: gold while this is the station the active order needs.
  ctx.fillStyle = isCurrent ? C.gold : C.stationTop;
  rr(ctx, slot.x, slot.y, slot.w, 54, 12); ctx.fill();
  ctx.fillRect(slot.x, slot.y + 28, slot.w, 26);
  // Label + hotkey.
  ctx.fillStyle = isCurrent ? C.textDark : '#ffffff';
  ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText((isCurrent ? '▶ ' : '') + slot.label, slot.x + 14, slot.y + 34);
  ctx.fillStyle = C.gold;
  ctx.beginPath(); ctx.arc(slot.x + slot.w - 26, slot.y + 26, 15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.textDark;
  ctx.font = 'bold 17px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(slot.key, slot.x + slot.w - 26, slot.y + 32);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffd9a8';
  ctx.font = 'bold 14px "Trebuchet MS", sans-serif';
  ctx.fillText(slot.sub, slot.x + 14, slot.y + 74);
  // Station body.
  if (slot.id === 'chop') drawChopBody(ctx, world, slot, st);
  if (slot.id === 'wok') drawWokBody(ctx, world, slot, st);
  if (slot.id === 'grill') drawGrillBody(ctx, world, slot, st);
  if (slot.id === 'pour') drawPourBody(ctx, world, slot, st);
  // Progress bar: only the station the active order needs shows progress.
  const order = activeOrder(world);
  const step = order ? nextStep(order) : null;
  let frac = 0;
  let label = 'SIAGA';
  if (step && stationForStep(step) === slot.id) {
    frac = step.done / step.need;
    label = stepVerb(step.kind) + ' ' + Math.round(frac * 100) + '%';
    if (slot.id === 'chop') label = 'POTONG ' + step.done + '/' + step.need;
    if (slot.id === 'grill' && st.flipWindow) label = 'BALIK SEKARANG!';
  }
  const barY = slot.y + slot.h - 42;
  ctx.fillStyle = '#5a3a20';
  rr(ctx, slot.x + 14, barY, slot.w - 28, 18, 9); ctx.fill();
  if (frac > 0) {
    ctx.fillStyle = slot.id === 'wok' ? C.teal : C.gold;
    rr(ctx, slot.x + 14, barY, Math.max(20, (slot.w - 28) * frac), 18, 9); ctx.fill();
  }
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, slot.x + slot.w / 2, barY + 34);
  ctx.textAlign = 'left';
  // Current-station highlight: gold frame, no text above the station
  // (the bins row sits right above it).
  if (isCurrent && world.phase === 'playing') {
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 5;
    rr(ctx, slot.x - 3, slot.y - 3, slot.w + 6, slot.h + 6, 14); ctx.stroke();
  }
}

function drawChopBody(ctx, world, slot, st) {
  const t = tNow(world);
  const cx = slot.x + slot.w / 2;
  const cy = slot.y + 150;
  // Wooden board.
  ctx.fillStyle = '#d9b380';
  rr(ctx, cx - 80, cy - 42, 160, 84, 8); ctx.fill();
  ctx.strokeStyle = '#a87c4a';
  ctx.lineWidth = 2;
  rr(ctx, cx - 80, cy - 42, 160, 84, 8); ctx.stroke();
  // Chopped pieces.
  ctx.fillStyle = '#f3e2c7';
  const n = Math.min(3, st.hits);
  for (let i = 0; i < 3; i++) {
    const px = cx - 40 + i * 40;
    const py = cy - 10 + (i % 2) * 18;
    ctx.beginPath(); ctx.arc(px, py, i < n ? 9 : 13, 0, Math.PI * 2); ctx.fill();
    if (i < n) {
      ctx.strokeStyle = '#c9a86a';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(px - 6, py); ctx.lineTo(px + 6, py); ctx.stroke();
    }
  }
  // Knife, bobbing while chopping.
  const bob = st.knife > 0 ? Math.sin(st.knife * 40) * 8 : Math.sin(t * 1.5) * 2;
  ctx.save();
  ctx.translate(cx + 52, cy - 30 + bob);
  ctx.rotate(0.5);
  ctx.fillStyle = '#cfd6dd';
  ctx.fillRect(-6, -26, 12, 44);
  ctx.fillStyle = '#2b1d16';
  ctx.fillRect(-6, 18, 12, 20);
  ctx.restore();
}

function drawWokBody(ctx, world, slot, st) {
  const t = tNow(world);
  const cx = slot.x + slot.w / 2;
  const cy = slot.y + 150;
  // Flame under the wok.
  const flick = 0.8 + Math.sin(t * 9) * 0.2;
  ctx.fillStyle = '#e4572e';
  ctx.beginPath();
  ctx.moveTo(cx - 34, cy + 34);
  ctx.quadraticCurveTo(cx - 20, cy + 6 * flick, cx, cy + 30);
  ctx.quadraticCurveTo(cx + 20, cy + 6 * flick, cx + 34, cy + 34);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#f2a541';
  ctx.beginPath();
  ctx.moveTo(cx - 20, cy + 34);
  ctx.quadraticCurveTo(cx - 8, cy + 16 * flick, cx, cy + 32);
  ctx.quadraticCurveTo(cx + 8, cy + 16 * flick, cx + 20, cy + 34);
  ctx.closePath(); ctx.fill();
  // Wok bowl.
  ctx.fillStyle = '#3a3a3a';
  ctx.beginPath(); ctx.arc(cx, cy - 6, 52, 0, Math.PI); ctx.fill();
  ctx.fillStyle = '#555555';
  ctx.beginPath(); ctx.ellipse(cx, cy - 6, 52, 14, 0, 0, Math.PI * 2); ctx.fill();
  // Food in the wok.
  ctx.fillStyle = '#e8862e';
  ctx.beginPath(); ctx.ellipse(cx, cy - 10, 40, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f2c14e';
  ctx.beginPath(); ctx.arc(cx - 16, cy - 12, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 14, cy - 14, 6, 0, Math.PI * 2); ctx.fill();
  // Steam.
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (let i = 0; i < 3; i++) {
    const sx = cx - 24 + i * 24 + Math.sin(t * 2 + i) * 4;
    const sy = cy - 34 - ((t * 22 + i * 18) % 34);
    ctx.beginPath(); ctx.arc(sx, sy, 6, 0, Math.PI * 2); ctx.fill();
  }
  // Heat meter with a green sweet zone.
  const mx = slot.x + 16;
  const my = slot.y + 205;
  const mw = slot.w - 32;
  ctx.fillStyle = '#5a3a20';
  rr(ctx, mx, my, mw, 14, 7); ctx.fill();
  ctx.fillStyle = '#2e9e5b';
  ctx.fillRect(mx + mw * 0.35, my, mw * 0.43, 14);
  ctx.fillStyle = '#d63a2f';
  ctx.fillRect(mx + mw * 0.92, my, mw * 0.08, 14);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(mx + mw * st.heat - 6, my - 4);
  ctx.lineTo(mx + mw * st.heat + 6, my - 4);
  ctx.lineTo(mx + mw * st.heat, my + 8);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd9a8';
  ctx.font = 'bold 13px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Jaga api di zona hijau!', cx, my + 26);
  ctx.textAlign = 'left';
}

function drawGrillBody(ctx, world, slot, st) {
  const t = tNow(world);
  const cx = slot.x + slot.w / 2;
  const cy = slot.y + 150;
  // Charcoal bed.
  ctx.fillStyle = '#2b1d16';
  rr(ctx, cx - 78, cy + 6, 156, 26, 6); ctx.fill();
  const glow = 0.6 + Math.sin(t * 5) * 0.3;
  ctx.fillStyle = 'rgba(228,87,46,' + glow.toFixed(2) + ')';
  ctx.beginPath(); ctx.arc(cx - 40, cy + 18, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 10, cy + 18, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 44, cy + 18, 7, 0, Math.PI * 2); ctx.fill();
  // Grill bars.
  ctx.strokeStyle = '#8a8a8a';
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath(); ctx.moveTo(cx - 78, cy - 22 + i * 8); ctx.lineTo(cx + 78, cy - 22 + i * 8); ctx.stroke();
  }
  // Two skewers of sate.
  for (let r = 0; r < 2; r++) {
    const sy = cy - 26 + r * 22;
    ctx.strokeStyle = '#8a5a33';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(cx - 70, sy); ctx.lineTo(cx + 70, sy); ctx.stroke();
    ctx.fillStyle = '#8a4a1e';
    for (let i = 0; i < 4; i++) {
      const px = cx - 52 + i * 34;
      ctx.fillRect(px - 8, sy - 8, 16, 16);
      ctx.fillStyle = '#a8612a';
      ctx.fillRect(px - 8, sy - 8, 16, 5);
      ctx.fillStyle = '#8a4a1e';
    }
  }
  // Smoke.
  ctx.fillStyle = 'rgba(200,200,200,0.5)';
  for (let i = 0; i < 2; i++) {
    const sx = cx - 30 + i * 60 + Math.sin(t * 1.6 + i * 2) * 5;
    const sy = cy - 44 - ((t * 16 + i * 22) % 26);
    ctx.beginPath(); ctx.arc(sx, sy, 5, 0, Math.PI * 2); ctx.fill();
  }
  if (st.flipWindow) {
    ctx.fillStyle = '#ff8a7a';
    ctx.font = 'bold 19px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BALIK! (klik)', cx, slot.y + 232);
    ctx.textAlign = 'left';
  }
}

function drawPourBody(ctx, world, slot, st) {
  const t = tNow(world);
  const cx = slot.x + slot.w / 2;
  const cy = slot.y + 150;
  // Pitcher.
  ctx.fillStyle = '#2f7fc2';
  rr(ctx, cx - 66, cy - 34, 44, 64, 8); ctx.fill();
  ctx.fillStyle = '#c96a1e';
  rr(ctx, cx - 62, cy - 26, 36, 40, 6); ctx.fill();
  // Glass with fill level.
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.9;
  rr(ctx, cx + 6, cy - 40, 52, 74, 6); ctx.fill();
  ctx.globalAlpha = 1;
  const lvl = Math.min(100, st.level);
  if (lvl > 0) {
    ctx.fillStyle = '#c96a1e';
    const fh = 66 * (lvl / 100);
    rr(ctx, cx + 10, cy + 26 - fh, 44, fh, 4); ctx.fill();
  }
  ctx.fillStyle = '#dff2fb';
  if (lvl > 30) ctx.fillRect(cx + 16, cy - 6, 10, 10);
  if (lvl > 60) ctx.fillRect(cx + 36, cy + 4, 10, 10);
  // Target zone hint.
  ctx.fillStyle = '#2e9e5b';
  ctx.font = 'bold 14px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Isi sampai hijau!', cx, slot.y + 232);
  ctx.textAlign = 'left';
  // Pour stream while holding.
  if (st.holding) {
    ctx.strokeStyle = '#c96a1e';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(cx - 30, cy + 30); ctx.lineTo(cx + 32, cy - 40); ctx.stroke();
  }
  void t;
}

// ---- plating counter ----
function drawPlating(ctx, world) {
  const C = DK.COLORS;
  const p = DK.LAYOUT.plating;
  ctx.fillStyle = C.counter;
  rr(ctx, p.x, p.y, p.w, p.h, 12); ctx.fill();
  ctx.fillStyle = C.counterTop;
  rr(ctx, p.x, p.y, p.w, 40, 12); ctx.fill();
  ctx.fillRect(p.x, p.y + 20, p.w, 20);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('PIRING SAJI', p.x + 16, p.y + 28);
  ctx.fillStyle = '#ffd9a8';
  ctx.font = 'bold 14px "Trebuchet MS", sans-serif';
  ctx.fillText('klik piring / Spasi untuk menyajikan', p.x + 170, p.y + 27);
  // Status line between the header and the plates: what is being built,
  // or that the dish is ready. Kept here so the chef, who stands in front
  // of the counter, never covers it.
  const order = activeOrder(world);
  ctx.textAlign = 'center';
  if (world.plate) {
    ctx.fillStyle = '#8fe6a8';
    ctx.font = 'bold 21px "Trebuchet MS", sans-serif';
    ctx.fillText(world.plate.name + ' SIAP DISAJIKAN!', p.x + p.w / 2, p.y + 66);
  } else if (order) {
    const step = nextStep(order);
    ctx.fillStyle = '#ffe9b8';
    ctx.font = 'bold 18px "Trebuchet MS", sans-serif';
    ctx.fillText('Dirakit: ' + order.name + (step ? ' — ' + step.label : ''), p.x + p.w / 2, p.y + 66);
  } else {
    ctx.fillStyle = '#c9a86a';
    ctx.font = 'bold 17px "Trebuchet MS", sans-serif';
    ctx.fillText('Piring kosong — selesaikan pesanan', p.x + p.w / 2, p.y + 66);
  }
  ctx.textAlign = 'left';
  // Two plate spots.
  for (let i = 0; i < 2; i++) {
    const px = p.x + 110 + i * 260;
    const py = p.y + 130;
    ctx.fillStyle = C.plate;
    ctx.beginPath(); ctx.ellipse(px, py, 86, 56, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#d9c9a8';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(px, py, 86, 56, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(px, py, 62, 38, 0, 0, Math.PI * 2); ctx.stroke();
  }
  if (world.plate) {
    drawDish(ctx, world.plate.dishId, p.x + 110, p.y + 118, 1.15);
  }
}

// ---- customer area + serve button ----
function drawCustomer(ctx, world) {
  const C = DK.COLORS;
  const a = DK.LAYOUT.customer;
  ctx.fillStyle = '#e8dcc0';
  rr(ctx, a.x, a.y, a.w, a.h, 12); ctx.fill();
  ctx.strokeStyle = '#c9a86a';
  ctx.lineWidth = 3;
  rr(ctx, a.x, a.y, a.w, a.h, 12); ctx.stroke();
  // Customer figure.
  const cx = a.x + 84;
  const cy = a.y + 120;
  ctx.fillStyle = '#f2c14e';
  ctx.beginPath(); ctx.arc(cx, cy - 42, 30, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2b1d16';
  ctx.beginPath(); ctx.arc(cx - 11, cy - 46, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 11, cy - 46, 4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2b1d16';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy - 34, 12, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  ctx.fillStyle = '#17817b';
  ctx.beginPath(); ctx.arc(cx, cy - 66, 30, Math.PI, 0); ctx.fill();
  ctx.fillRect(cx - 30, cy - 68, 60, 8);
  ctx.fillStyle = '#e4572e';
  rr(ctx, cx - 34, cy - 12, 68, 74, 12); ctx.fill();
  // Speech bubble.
  const order = activeOrder(world);
  const bx = a.x + 150;
  const by = a.y + 26;
  ctx.fillStyle = '#ffffff';
  rr(ctx, bx, by, 200, 84, 12); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bx + 8, by + 60); ctx.lineTo(bx - 14, by + 74); ctx.lineTo(bx + 26, by + 84);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = C.textDark;
  ctx.font = 'bold 19px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'left';
  if (order) {
    ctx.fillText('“' + order.name + ',”', bx + 14, by + 32);
    ctx.fillText('tolong cepat ya!', bx + 14, by + 58);
  } else {
    ctx.fillText('“Lapar nih…”', bx + 14, by + 32);
    ctx.fillText('pesan dulu, yuk!', bx + 14, by + 58);
  }
  // Serve button.
  const s = DK.SERVE;
  const ready = world.plate !== null;
  ctx.fillStyle = ready ? C.good : '#a89878';
  rr(ctx, s.x, s.y, s.w, s.h, 12); ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  rr(ctx, s.x, s.y, s.w, s.h, 12); ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(ready ? 'SAJIKAN! (Spasi)' : 'SAJIKAN', s.x + s.w / 2, s.y + 35);
  ctx.textAlign = 'left';
  ctx.fillStyle = C.textMuted;
  ctx.font = 'bold 14px "Trebuchet MS", sans-serif';
  ctx.fillText('Tersaji: ' + world.served + '  •  Sempurna: ' + world.perfectServes, a.x + 16, a.y + a.h - 14);
}

// ---- chef figure, standing in front of the plating counter ----
function drawChef(ctx, world) {
  const t = tNow(world);
  const cx = Math.max(360, Math.min(860, world.chef.x));
  const baseY = 736;
  const bob = Math.sin(t * 3) * 2;
  // Body: white chef coat, apron, hat.
  ctx.fillStyle = '#ffffff';
  rr(ctx, cx - 26, baseY - 58 + bob, 52, 58, 12); ctx.fill();
  ctx.fillStyle = '#17817b';
  ctx.fillRect(cx - 26, baseY - 20 + bob, 52, 20);
  ctx.fillStyle = '#f2c9a0';
  ctx.beginPath(); ctx.arc(cx, baseY - 72 + bob, 22, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(cx - 12, baseY - 88 + bob, 12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, baseY - 92 + bob, 13, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 12, baseY - 88 + bob, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2b1d16';
  ctx.beginPath(); ctx.arc(cx - 8, baseY - 74 + bob, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 8, baseY - 74 + bob, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2b1d16';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, baseY - 66 + bob, 7, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
}

// ---- toast, rush banner, overlays ----
function drawToast(ctx, world) {
  // The rush banner owns the top strip while it is up; the toast waits.
  if (!world.toast || world.phase !== 'playing' || world.rushBanner > 0) return;
  ctx.fillStyle = 'rgba(43,29,22,0.92)';
  const w = 640;
  rr(ctx, 640 - w / 2, 76, w, 40, 10); ctx.fill();
  ctx.fillStyle = '#ffe9b8';
  ctx.font = 'bold 19px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(world.toast.text, 640, 103);
  ctx.textAlign = 'left';
}

function drawRushBanner(ctx, world) {
  if (world.rushBanner <= 0 && world.rushTimer <= 0) return;
  const pulse = 0.75 + Math.sin(tNow(world) * 6) * 0.25;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#d63a2f';
  rr(ctx, 380, 70, 520, 44, 12); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('RUSH! PESANAN MEMBLUDAK!', 640, 100);
  ctx.restore();
  ctx.textAlign = 'left';
}

function drawTitle(ctx, world) {
  ctx.fillStyle = 'rgba(43,29,22,0.72)';
  ctx.fillRect(0, 0, DK.W, DK.H);
  ctx.fillStyle = '#fff6e0';
  rr(ctx, 290, 150, 700, 420, 18); ctx.fill();
  ctx.strokeStyle = DK.COLORS.gold;
  ctx.lineWidth = 4;
  rr(ctx, 290, 150, 700, 420, 18); ctx.stroke();
  ctx.fillStyle = DK.COLORS.accent;
  ctx.font = 'bold 64px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DAPUR KILAT', 640, 240);
  ctx.fillStyle = DK.COLORS.textDark;
  ctx.font = 'bold 24px "Trebuchet MS", sans-serif';
  ctx.fillText('Warung cepat saji — masak, sajikan, jangan sampai gosong!', 640, 282);
  ctx.font = '20px "Trebuchet MS", sans-serif';
  ctx.fillStyle = DK.COLORS.textMuted;
  ctx.fillText('Klik tiket pesanan, lalu kerjakan langkahnya di stasiun:', 640, 330);
  ctx.fillText('1 TALENAN potong  •  2 WOK tumis (jaga api hijau)', 640, 360);
  ctx.fillText('3 PANGGANGAN bakar & balik  •  4 ES TEH tuang sampai pas', 640, 390);
  ctx.fillText('Spasi sajikan  •  R mulai ulang  •  M bisu', 640, 420);
  ctx.fillStyle = DK.COLORS.teal;
  ctx.font = 'bold 22px "Trebuchet MS", sans-serif';
  ctx.fillText('Nasi Goreng  •  Mie Ayam  •  Sate Ayam  •  Es Teh Manis', 640, 462);
  const pulse = 0.7 + Math.sin(tNow(world) * 4) * 0.3;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = DK.COLORS.accent;
  ctx.font = 'bold 28px "Trebuchet MS", sans-serif';
  ctx.fillText('KLIK UNTUK MULAI SHIFT', 640, 524);
  ctx.restore();
  ctx.textAlign = 'left';
}

function drawGameOver(ctx, world) {
  ctx.fillStyle = 'rgba(43,29,22,0.78)';
  ctx.fillRect(0, 0, DK.W, DK.H);
  ctx.fillStyle = '#fff6e0';
  rr(ctx, 340, 160, 600, 400, 18); ctx.fill();
  ctx.strokeStyle = DK.COLORS.gold;
  ctx.lineWidth = 4;
  rr(ctx, 340, 160, 600, 400, 18); ctx.stroke();
  ctx.fillStyle = DK.COLORS.accent;
  ctx.font = 'bold 52px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SHIFT SELESAI!', 640, 240);
  ctx.fillStyle = DK.COLORS.textDark;
  ctx.font = 'bold 30px "Trebuchet MS", sans-serif';
  ctx.fillText('Skor akhir: ' + world.score, 640, 300);
  ctx.font = '22px "Trebuchet MS", sans-serif';
  ctx.fillText('Pesanan tersaji: ' + world.served + '  •  Sempurna: ' + world.perfectServes, 640, 344);
  ctx.fillText('Omzet: ' + fmtRp(world.coins), 640, 378);
  const best = world.served > 0 ? Math.round(world.score / world.served) : 0;
  ctx.fillText('Rata-rata per pesanan: ' + best + ' poin', 640, 412);
  const pulse = 0.7 + Math.sin(tNow(world) * 4) * 0.3;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = DK.COLORS.teal;
  ctx.font = 'bold 26px "Trebuchet MS", sans-serif';
  ctx.fillText('Tekan R / klik untuk shift berikutnya', 640, 500);
  ctx.restore();
  ctx.textAlign = 'left';
}

function drawHint(ctx) {
  const h = DK.LAYOUT.hint;
  ctx.fillStyle = DK.COLORS.textMuted;
  ctx.font = 'bold 15px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Klik tiket → kerjakan di stasiun (1-4 / klik) → sajikan dengan Spasi  •  M bisu  •  R mulai ulang', 640, h.y + 20);
  ctx.textAlign = 'left';
}

// ---- top-level render ----
function renderGame(ctx, world) {
  drawBackground(ctx, world);
  drawHUD(ctx, world);
  drawBoard(ctx, world);
  drawBins(ctx);
  drawStations(ctx, world);
  drawPlating(ctx, world);
  drawCustomer(ctx, world);
  drawChef(ctx, world);
  drawToast(ctx, world);
  drawRushBanner(ctx, world);
  if (world.flash > 0) {
    ctx.fillStyle = 'rgba(214,58,47,' + (world.flash * 0.8).toFixed(2) + ')';
    ctx.fillRect(0, 0, DK.W, DK.H);
  }
  drawHint(ctx);
  if (world.phase === 'title') drawTitle(ctx, world);
  if (world.phase === 'over') drawGameOver(ctx, world);
}
