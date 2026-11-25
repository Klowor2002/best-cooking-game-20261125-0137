// Dapur Kilat — small seeded random number generator (mulberry32).
// Shots use it so a staged scene is identical every time it is taken;
// live play uses Math.random and never touches this.
function makeSeededRandom(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick one item from an array with a seeded generator.
function pickSeeded(rng, list) {
  return list[Math.floor(rng() * list.length) % list.length];
}

// Integer in [min, max] from a seeded generator.
function intSeeded(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}
