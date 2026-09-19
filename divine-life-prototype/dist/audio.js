/* Original procedural score and effects. No recordings or third-party samples. */
(() => {
  let context, music, effects, timer, phrase = 0;
  let settings = { music: 18, effects: 28, muted: false };
  try { Object.assign(settings, JSON.parse(localStorage.getItem('divine-audio') || '{}')); } catch {}
  const clamp = value => Math.max(0, Math.min(100, Number(value) || 0));
  settings.music = clamp(settings.music); settings.effects = clamp(settings.effects);
  function volumes() {
    if (!context) return;
    const silent = settings.muted || document.hidden;
    music.gain.setTargetAtTime(silent ? 0 : settings.music / 100 * .22, context.currentTime, .25);
    effects.gain.setTargetAtTime(silent ? 0 : settings.effects / 100 * .28, context.currentTime, .08);
  }
  function tone(bus, frequency, when, duration, amplitude = .15, type = 'sine') {
    const oscillator = context.createOscillator(), envelope = context.createGain();
    oscillator.type = type; oscillator.frequency.value = frequency;
    envelope.gain.setValueAtTime(0, when);
    envelope.gain.linearRampToValueAtTime(amplitude, when + Math.min(.6, duration / 4));
    envelope.gain.exponentialRampToValueAtTime(.0001, when + duration);
    oscillator.connect(envelope); envelope.connect(bus);
    oscillator.start(when); oscillator.stop(when + duration + .05);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
  }
  function score() {
    if (!context || context.state !== 'running' || document.hidden || settings.muted) return;
    const chords = [[146.83,220,293.66,329.63],[130.81,196,261.63,293.66],[116.54,174.61,233.08,293.66],[110,164.81,220,261.63]];
    const chord = chords[phrase++ % chords.length], now = context.currentTime;
    chord.forEach((frequency, i) => tone(music, frequency, now + i * .16, 10, .12));
    tone(music, chord[0] / 2, now, 11, .16);
    tone(music, chord[3] * 2, now + 3, 5, .035);
  }
  async function start() {
    try {
      if (!context) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        context = new Audio(); music = context.createGain(); effects = context.createGain();
        music.gain.value = 0; effects.gain.value = 0;
        const limiter = context.createDynamicsCompressor();
        music.connect(limiter); effects.connect(limiter); limiter.connect(context.destination);
      }
      await context.resume(); volumes();
      if (!timer) { score(); timer = setInterval(score, 8500); }
    } catch { /* Audio failure must never interrupt play. */ }
  }
  function play(kind) {
    if (!context || context.state !== 'running' || settings.muted || document.hidden) return;
    const now = context.currentTime;
    if (kind === 'shuffle' || kind === 'dice') {
      for (let i = 0; i < 6; i++) tone(effects, (kind === 'dice' ? 180 : 330) + i * 19, now + i * .09, .07, .12, 'triangle');
    } else if (kind === 'growth') {
      [523.25,659.25,783.99].forEach((f,i) => tone(effects,f,now+i*.13,.7,.11));
    } else if (kind === 'success') {
      // A restrained rising bell, distinct from the short stat-growth arpeggio.
      [392,493.88,587.33,783.99].forEach((f,i)=>tone(effects,f,now+i*.16,1.6,.13));
      tone(effects,196,now,2.1,.09);
    } else if (kind === 'failure') {
      // A descending, fading chord: no sharp noise or startling impact.
      [196,174.61,130.81].forEach((f,i)=>tone(effects,f,now+i*.30,1.8,.15,'triangle'));
      tone(effects,65.41,now+.12,2.4,.10);
    } else if (kind === 'regret') {
      [220,174.61,146.83].forEach((f,i) => tone(effects,f,now+i*.25,1.5,.12));
    } else tone(effects,440,now,.1,.07);
  }
  window.divineAudio = { start, play };
  document.getElementById('introStartButton').addEventListener('click', start);
  const mute = document.getElementById('audioMute');
  function sync() {
    mute.textContent = settings.muted ? '소리 켜기' : '전체 음소거';
    mute.setAttribute('aria-pressed', String(settings.muted));
    volumes(); try { localStorage.setItem('divine-audio', JSON.stringify(settings)); } catch {}
  }
  for (const key of ['music','effects']) {
    const input = document.getElementById(`audio-${key}`), output = document.getElementById(`audio-${key}-value`);
    input.value = settings[key]; output.textContent = `${settings[key]}%`;
    input.addEventListener('input', () => { settings[key] = clamp(input.value); output.textContent = `${settings[key]}%`; sync(); });
    input.addEventListener('change', () => { start(); if (key === 'effects') play('growth'); });
  }
  mute.addEventListener('click', () => { settings.muted = !settings.muted; sync(); if (!settings.muted) start(); });
  document.addEventListener('visibilitychange', () => { volumes(); if (!document.hidden) score(); });
  sync();
})();
