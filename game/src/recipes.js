// Dapur Kilat — the menu: every dish, its steps, and how it is drawn.
// A step names a station kind; the player works the steps in order and
// the dish lands on the plating counter when the last step is done.
const RECIPES = {
  nasiGoreng: {
    id: 'nasiGoreng',
    name: 'Nasi Goreng',
    short: 'NasGor',
    price: 15000,
    color: '#e8862e',
    steps: [
      { kind: 'chop', label: 'Potong bawang', need: 3, ingredient: 'Bawang' },
      { kind: 'wok', label: 'Tumis di wok', need: 100, ingredient: 'Nasi + Telur' },
      { kind: 'plate', label: 'Tata di piring', need: 1, ingredient: '' }
    ]
  },
  mieAyam: {
    id: 'mieAyam',
    name: 'Mie Ayam',
    short: 'MieAyam',
    price: 13000,
    color: '#f2c14e',
    steps: [
      { kind: 'chop', label: 'Potong ayam', need: 3, ingredient: 'Ayam' },
      { kind: 'wok', label: 'Rebus & tumis mie', need: 100, ingredient: 'Mie + Ayam' },
      { kind: 'plate', label: 'Tata di piring', need: 1, ingredient: '' }
    ]
  },
  sateAyam: {
    id: 'sateAyam',
    name: 'Sate Ayam',
    short: 'Sate',
    price: 18000,
    color: '#b3541e',
    steps: [
      { kind: 'chop', label: 'Potong ayam', need: 2, ingredient: 'Ayam' },
      { kind: 'grill', label: 'Bakar di arang', need: 100, ingredient: 'Ayam + Bumbu' },
      { kind: 'plate', label: 'Tata di piring', need: 1, ingredient: '' }
    ]
  },
  esTeh: {
    id: 'esTeh',
    name: 'Es Teh Manis',
    short: 'EsTeh',
    price: 5000,
    color: '#c96a1e',
    steps: [
      { kind: 'pour', label: 'Tuang teh', need: 100, ingredient: 'Teh + Es' },
      { kind: 'plate', label: 'Tata di piring', need: 1, ingredient: '' }
    ]
  }
};

// The dishes customers can order, weighted so the quick drink shows up
// less often than the cooked dishes.
const MENU = ['nasiGoreng', 'nasiGoreng', 'mieAyam', 'mieAyam', 'sateAyam', 'esTeh'];

// Station kind for a step kind: chop/wok/grill/pour map to their station,
// plate is done on the plating counter.
function stationForStep(step) {
  return step.kind === 'plate' ? 'plating' : step.kind;
}

// Human label for a step kind, used on tickets and toasts.
function stepVerb(kind) {
  if (kind === 'chop') return 'POTONG';
  if (kind === 'wok') return 'TUMIS';
  if (kind === 'grill') return 'BAKAR';
  if (kind === 'pour') return 'TUANG';
  return 'TATA';
}
