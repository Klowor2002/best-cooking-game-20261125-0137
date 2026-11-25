// Dapur Kilat — tuning and layout constants. One place for every number
// the rest of the game reads, so balancing is an edit here, not a hunt.
const DK = {};

// Canvas the game draws into (fixed logical size; CSS scales it).
DK.W = 1280;
DK.H = 800;

// Shift length in seconds and the rush waves inside it.
DK.SHIFT_SECONDS = 180;
DK.RUSH_AT = [60, 120];
DK.RUSH_LENGTH = 20;

// How many tickets may wait on the order board at once.
DK.MAX_ORDERS = 3;

// Patience: seconds a ticket lives before the customer walks out.
// Rush multiplies the drain, it never shortens the bar itself.
DK.PATIENCE_MIN = 48;
DK.PATIENCE_MAX = 72;
DK.RUSH_DRAIN = 1.5;

// Score: base per dish, bonus for patience left, combo step.
DK.SCORE_BASE = 100;
DK.SCORE_PATIENCE_BONUS = 120;
DK.SCORE_PERFECT = 50;
DK.COMBO_WINDOW = 10;
DK.COMBO_STEP = 25;

// Palette — warm warung: cream walls, terracotta counters, teal accents.
DK.COLORS = {
  wall: '#f6e7c8',
  wallBand: '#eed9ae',
  floor: '#c98d5a',
  floorLine: '#b57a48',
  hud: '#2b1d16',
  hudText: '#ffe9b8',
  accent: '#e4572e',
  teal: '#17817b',
  gold: '#f2a541',
  cream: '#fff6e0',
  board: '#3a2a1e',
  boardEdge: '#6b4a2f',
  ticket: '#fff6e0',
  ticketEdge: '#d9b380',
  station: '#8a5a33',
  stationTop: '#a9713f',
  counter: '#7c4a26',
  counterTop: '#9c6238',
  plate: '#ffffff',
  textDark: '#2b1d16',
  textMuted: '#7a5c40',
  good: '#2e9e5b',
  warn: '#e8a13a',
  bad: '#d63a2f',
  chop: '#e4572e',
  wok: '#17817b',
  grill: '#b3541e',
  pour: '#2f7fc2'
};

// Layout rectangles, in canvas pixels.
DK.LAYOUT = {
  hud: { x: 0, y: 0, w: 1280, h: 64 },
  board: { x: 16, y: 80, w: 280, h: 470 },
  bins: { x: 320, y: 118, w: 944, h: 84 },
  stations: { x: 320, y: 214, w: 944, h: 290 },
  plating: { x: 320, y: 510, w: 560, h: 236 },
  customer: { x: 896, y: 510, w: 368, h: 236 },
  hint: { x: 16, y: 762, w: 1248, h: 30 }
};

// Ticket cards inside the order board: first card offset, step, height.
DK.TICKET = { y0: 52, step: 140, h: 128 };

// Station slots: id, key, label, kind, x/y/w/h inside the stations band.
DK.STATIONS = [
  { id: 'chop', key: '1', label: 'TALENAN', sub: 'Potong', kind: 'chop',
    x: 320, y: 214, w: 224, h: 290 },
  { id: 'wok', key: '2', label: 'WOK', sub: 'Tumis', kind: 'wok',
    x: 560, y: 214, w: 224, h: 290 },
  { id: 'grill', key: '3', label: 'PANGGANGAN', sub: 'Bakar', kind: 'grill',
    x: 800, y: 214, w: 224, h: 290 },
  { id: 'pour', key: '4', label: 'ES TEH', sub: 'Tuang', kind: 'pour',
    x: 1040, y: 214, w: 224, h: 290 }
];

// Ingredient bins shown on the counter (decorative + recipe hints).
DK.BINS = [
  { name: 'Bawang', color: '#f3e2c7', dot: '#c9a86a' },
  { name: 'Cabai', color: '#d63a2f', dot: '#a11f16' },
  { name: 'Ayam', color: '#f2c14e', dot: '#d99a1f' },
  { name: 'Telur', color: '#fff6e0', dot: '#e8c97a' },
  { name: 'Nasi', color: '#fdf3d8', dot: '#e0c98f' },
  { name: 'Mie', color: '#f2c14e', dot: '#c98f1f' }
];

// Serve button rectangle (inside the customer area).
DK.SERVE = { x: 928, y: 668, w: 304, h: 52 };
