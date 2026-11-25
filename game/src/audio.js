// Dapur Kilat — all sound is WebAudio bleeps, no audio files.
// The context is created on the first user gesture (browsers require it).
const Sound = {
  ctx: null,
  muted: false,
  sizzle: null,

  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
      } catch (e) {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  // One short tone: frequency, seconds, shape, volume.
  blip(freq, dur, type, vol) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(vol || 0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  },

  // Two-note chirp, up or down.
  chirp(f1, f2, dur) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f1, t);
    osc.frequency.exponentialRampToValueAtTime(f2, t + dur);
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  },

  chop() { this.blip(180, 0.07, 'square', 0.10); this.blip(90, 0.09, 'sine', 0.12); },
  stir() { this.blip(320 + Math.random() * 80, 0.05, 'triangle', 0.07); },
  flip() { this.chirp(300, 620, 0.12); },
  pour() { this.blip(520, 0.08, 'sine', 0.06); },
  ding() { this.blip(880, 0.18, 'sine', 0.14); this.blip(1320, 0.22, 'sine', 0.10); },
  serve() { this.chirp(520, 1040, 0.16); this.blip(1560, 0.14, 'sine', 0.08); },
  error() { this.blip(140, 0.16, 'sawtooth', 0.08); },
  alarm() { this.chirp(660, 440, 0.22); },
  click() { this.blip(600, 0.04, 'square', 0.05); },
  rush() { this.chirp(220, 880, 0.4); },
  over() { this.chirp(520, 180, 0.6); },

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
};
