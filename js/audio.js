// Procedural cozy retro Web Audio API SFX & ambient chiptune BGM
window.SoundFX = (function () {
  let ctx = null;
  let enabled = true;
  let bgmTimer = null;
  let bgmStep = 0;

  // Gentle Stardew-like pentatonic melody (C major / G major pastoral vibe)
  const melody = [
    523.25, 659.25, 783.99, 659.25, 587.33, 0, 523.25, 440.0,
    392.0, 440.0, 523.25, 587.33, 659.25, 0, 587.33, 0,
    523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25,
    440.0, 523.25, 587.33, 392.0, 523.25, 0, 0, 0
  ];
  const bass = [
    261.63, 0, 196.0, 0, 220.0, 0, 196.0, 0,
    174.61, 0, 196.0, 0, 261.63, 0, 196.0, 0,
    261.63, 0, 196.0, 0, 220.0, 0, 196.0, 0,
    174.61, 0, 196.0, 0, 261.63, 0, 0, 0
  ];

  function ensureContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function tone(freq, duration, type = 'triangle', volume = 0.08, delay = 0) {
    if (!enabled) return;
    const c = ensureContext();
    if (!c) return;
    const now = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function startBGM() {
    if (bgmTimer || !enabled) return;
    bgmTimer = setInterval(() => {
      if (!enabled || !ctx || ctx.state !== 'running') return;
      const m = melody[bgmStep % melody.length];
      const b = bass[bgmStep % bass.length];
      if (m > 0) tone(m, 0.36, 'triangle', 0.028);
      if (b > 0) tone(b, 0.42, 'sine', 0.024);
      bgmStep++;
    }, 420);
  }

  function stopBGM() {
    if (bgmTimer) {
      clearInterval(bgmTimer);
      bgmTimer = null;
    }
  }

  return {
    init() {
      ensureContext();
      startBGM();
    },
    isEnabled() {
      return enabled;
    },
    toggle() {
      enabled = !enabled;
      if (enabled) {
        ensureContext();
        startBGM();
        this.click();
      } else {
        stopBGM();
      }
      return enabled;
    },
    click() {
      tone(420, 0.06, 'triangle', 0.07);
      tone(560, 0.05, 'triangle', 0.05, 0.02);
    },
    step() {
      tone(150 + Math.random() * 35, 0.035, 'sine', 0.025);
    },
    talk() {
      tone(320 + Math.random() * 140, 0.055, 'triangle', 0.05);
    },
    pickup() {
      tone(523.25, 0.08, 'triangle', 0.09, 0);
      tone(659.25, 0.08, 'triangle', 0.09, 0.06);
      tone(783.99, 0.14, 'triangle', 0.1, 0.12);
    },
    useItem() {
      tone(440, 0.08, 'sine', 0.08, 0);
      tone(660, 0.14, 'triangle', 0.09, 0.07);
    },
    questComplete() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, i) => tone(n, 0.22, 'triangle', 0.11, i * 0.11));
    },
    error() {
      tone(220, 0.12, 'sawtooth', 0.06, 0);
      tone(175, 0.16, 'sawtooth', 0.06, 0.09);
    },
    sleep() {
      const notes = [523.25, 440, 392, 329.63];
      notes.forEach((n, i) => tone(n, 0.25, 'sine', 0.06, i * 0.16));
    }
  };
})();
