// ============================================================================
// SYSTEM SAVIOUR - PROCEDURAL WEB AUDIO SYNTHESIZER ENGINE
// Zero external dependencies - 100% native Web Audio API
// ============================================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.ambientGain = null;
    this.isMuted = false;
    this.isAmbientPlaying = false;
    this.musicGain = null;
    this.musicFilter = null;
    this.musicInterval = null;
    this.isSaviourMusicPlaying = false;
    this.current16thNote = 0;
    this.nextNoteTime = 0;
    this.musicTargetGain = 0.16;

    // Load persisted mute state
    try {
      const savedMute = localStorage.getItem('systemsaviour_sound_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    } catch (e) {}
  }

  ensureContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.75, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  toggleMute() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('systemsaviour_sound_muted', this.isMuted.toString());
    } catch (e) {}

    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.75;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  setMuted(muted) {
    if (this.isMuted !== muted) {
      this.toggleMute();
    }
  }

  // 1. Crisp UI Button Click / Tab Switch
  playClick() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  // 2. Select / Mode Change / Level Tab Selected
  playSelect() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.085);
  }

  // 3. Placing a Component on the Canvas (Magnetic Thud)
  playPlaceNode() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Body tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.13);

    // Click transient
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(950, now);
    clickGain.gain.setValueAtTime(0.3, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    clickOsc.connect(clickGain);
    clickGain.connect(this.masterGain);
    clickOsc.start(now);
    clickOsc.stop(now + 0.03);
  }

  // 4. Connecting a Wire Between Components (Sci-Fi Laser Latch)
  playConnectWire() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [520, 1040].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.1);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.13);
    });
  }

  // 5. Deleting a Component or Disconnecting Wire (Power Down Whoosh)
  playDelete() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  // 6. Upgrading a Component Configuration (Ascending Tech Chime)
  playUpgrade() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [587.33, 880]; // D5, A5
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.15);
    });
  }

  // 7. Simulation Wave Started (Turbine Power Surge)
  playSimStart() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Sub rumble
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.45);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.52);
  }

  // 8. Simulation Wave Paused (Brake / Soft Air Release)
  playSimPause() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // 9. Warning SLA Radar Ping (High Queuing Latency or Drops)
  playWarning() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(980, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // 10. Server Crashed by Chaos Monkey (Explosion Arc & Alarm)
  playCrash() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Low sub blast
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.45);

    subGain.gain.setValueAtTime(0.5, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(now);
    subOsc.stop(now + 0.46);

    // Harsh glitch spark
    const sparkOsc = ctx.createOscillator();
    const sparkGain = ctx.createGain();
    sparkOsc.type = 'square';
    sparkOsc.frequency.setValueAtTime(440, now);
    sparkOsc.frequency.linearRampToValueAtTime(180, now + 0.2);

    sparkGain.gain.setValueAtTime(0.35, now);
    sparkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    sparkOsc.connect(sparkGain);
    sparkGain.connect(this.masterGain);
    sparkOsc.start(now);
    sparkOsc.stop(now + 0.22);
  }

  // 11. Chaos Monkey Glitch Alert (Monkey Alarm Siren)
  playChaosStrike() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const stepTime = now + i * 0.08;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(i % 2 === 0 ? 750 : 500, stepTime);

      gain.gain.setValueAtTime(0.3, stepTime);
      gain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.07);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(stepTime);
      osc.stop(stepTime + 0.075);
    }
  }

  // 12. Victory Fanfare (Level Passed & Budget Preserved)
  playVictory() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    // Major Arpeggio: C5, E5, G5, C6 with final resonant chord
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx === notes.length - 1 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (idx === notes.length - 1 ? 0.8 : 0.25));

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + (idx === notes.length - 1 ? 0.85 : 0.28));
    });
  }

  // 13. Defeat / SLA Breached Outage Drone
  playDefeat() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = [392.00, 311.13, 261.63, 130.81]; // G4, Eb4, C4, C3
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.16;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (idx === notes.length - 1 ? 0.7 : 0.3));

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + (idx === notes.length - 1 ? 0.75 : 0.32));
    });
  }

  // 14. Gentle Cyber Operations Ambient Drone (Toggleable)
  startAmbientDrone() {
    if (this.isAmbientPlaying || this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.035, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, ctx.currentTime);

      this.ambientOsc1 = ctx.createOscillator();
      this.ambientOsc2 = ctx.createOscillator();

      this.ambientOsc1.type = 'sine';
      this.ambientOsc1.frequency.setValueAtTime(55, ctx.currentTime); // A1 sub-bass

      this.ambientOsc2.type = 'triangle';
      this.ambientOsc2.frequency.setValueAtTime(82.41, ctx.currentTime); // E2 fifth

      this.ambientOsc1.connect(filter);
      this.ambientOsc2.connect(filter);
      filter.connect(this.ambientGain);
      this.ambientGain.connect(this.masterGain);

      this.ambientOsc1.start();
      this.ambientOsc2.start();
      this.isAmbientPlaying = true;
    } catch (e) {}
  }

  stopAmbientDrone() {
    if (!this.isAmbientPlaying) return;
    try {
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
      }
      setTimeout(() => {
        try {
          if (this.ambientOsc1) this.ambientOsc1.stop();
          if (this.ambientOsc2) this.ambientOsc2.stop();
        } catch (e) {}
        this.ambientOsc1 = null;
        this.ambientOsc2 = null;
        this.ambientGain = null;
        this.isAmbientPlaying = false;
      }, 300);
    } catch (e) {
      this.isAmbientPlaying = false;
    }
  }

  // ============================================================================
  // 15. SAVIOUR THEME BACKGROUND MUSIC (Procedural 124 BPM Heroic Synthwave)
  // ============================================================================
  startSaviourTheme() {
    if (this.isSaviourMusicPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      this.isSaviourMusicPlaying = true;
      this.musicGain = ctx.createGain();
      this.musicTargetGain = 0.16;
      this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : this.musicTargetGain, ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // Warm low-pass master filter for 80s/cyberpunk retro character
      this.musicFilter = ctx.createBiquadFilter();
      this.musicFilter.type = 'lowpass';
      this.musicFilter.frequency.setValueAtTime(1600, ctx.currentTime);
      this.musicFilter.connect(this.musicGain);

      // Tempo: 124 BPM
      const tempo = 124;
      const secondsPerBeat = 60.0 / tempo;
      const secondsPer16th = secondsPerBeat / 4; // ~0.121s

      this.current16thNote = 0;
      this.nextNoteTime = ctx.currentTime + 0.05;

      const scheduleAheadTime = 0.25;
      const lookahead = 35; // ms

      // Chords: Dm -> Bb -> F -> C
      const chords = [
        [146.83, 174.61, 220.00], // Dm (D3, F3, A3)
        [116.54, 146.83, 174.61], // Bb (Bb2, D3, F3)
        [130.81, 174.61, 220.00], // F  (C3, F3, A3)
        [130.81, 164.81, 196.00], // C  (C3, E3, G3)
      ];

      // Bass roots per measure: D2, Bb1, F2, C2
      const bassRoots = [73.42, 58.27, 87.31, 65.41];

      // Hero melody notes (64 16th steps = 4 full bars)
      const D4=293.66, E4=329.63, F4=349.23, G4=392.00, A4=440.00, Bb4=466.16, C5=523.25, D5=587.33, E5=659.25, F5=698.46;
      const melodySteps = [
        // Bar 1 (Dm Hero motif)
        D4, null, F4, null, A4, null, D5, null, A4, null, F4, null, G4, null, A4, null,
        // Bar 2 (Bb resolve & drive)
        Bb4, null, A4, null, F4, null, D4, null, F4, null, Bb4, null, C5, null, D5, null,
        // Bar 3 (F high flight)
        C5, null, A4, null, F4, null, C5, null, F4, null, A4, null, C5, null, F5, null,
        // Bar 4 (C heroic conclusion & turnaround)
        E5, null, D5, null, C5, null, G4, null, C5, null, E5, null, D5, null, C5, null,
      ];

      const playKick = (time) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(130, time);
        osc.frequency.exponentialRampToValueAtTime(32, time + 0.1);
        gain.gain.setValueAtTime(0.35, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
        osc.connect(gain);
        gain.connect(this.musicFilter);
        osc.start(time);
        osc.stop(time + 0.13);
      };

      const playHihat = (time) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'highpass';
        osc.frequency.setValueAtTime(7500, time);
        gain.gain.setValueAtTime(0.05, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);
        osc.connect(gain);
        gain.connect(this.musicFilter);
        osc.start(time);
        osc.stop(time + 0.04);
      };

      const playBass = (time, freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(420, time);
        filter.frequency.exponentialRampToValueAtTime(140, time + secondsPer16th * 0.9);

        gain.gain.setValueAtTime(0.24, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + secondsPer16th * 0.9);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicFilter);

        osc.start(time);
        osc.stop(time + secondsPer16th * 0.95);
      };

      const playPad = (time, duration, chordFreqs) => {
        chordFreqs.forEach(freq => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, time);

          gain.gain.setValueAtTime(0.001, time);
          gain.gain.linearRampToValueAtTime(0.045, time + 0.18);
          gain.gain.setValueAtTime(0.045, time + duration - 0.18);
          gain.gain.linearRampToValueAtTime(0.001, time + duration);

          osc.connect(gain);
          gain.connect(this.musicFilter);

          osc.start(time);
          osc.stop(time + duration);
        });
      };

      const playLead = (time, freq, dur) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.075, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur * 0.9);

        osc.connect(gain);
        gain.connect(this.musicFilter);

        osc.start(time);
        osc.stop(time + dur * 0.95);
      };

      const scheduleStep = (step, time) => {
        const barIndex = Math.floor(step / 16) % 4;
        const stepInBar = step % 16;

        // Kick on beats 0, 4, 8, 12 (quarter notes)
        if (stepInBar % 4 === 0) {
          playKick(time);
        }
        // Hihat on offbeats 2, 6, 10, 14 (eighth notes)
        if (stepInBar % 4 === 2) {
          playHihat(time);
        }

        // Bassline on every 16th note with syncopated octave leap
        const baseFreq = bassRoots[barIndex];
        const isOctave = (stepInBar % 4 === 3);
        playBass(time, isOctave ? baseFreq * 2 : baseFreq);

        // Warm pad chord on start of each bar
        if (stepInBar === 0) {
          playPad(time, secondsPer16th * 16, chords[barIndex]);
        }

        // Hero Saviour Lead melody
        const melodyNote = melodySteps[step % 64];
        if (melodyNote) {
          playLead(time, melodyNote, secondsPer16th * 1.8);
        }
      };

      const scheduler = () => {
        if (!this.isSaviourMusicPlaying || !this.ctx) return;
        while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
          scheduleStep(this.current16thNote, this.nextNoteTime);
          this.nextNoteTime += secondsPer16th;
          this.current16thNote++;
        }
      };

      this.musicInterval = setInterval(scheduler, lookahead);
    } catch (e) {
      this.isSaviourMusicPlaying = false;
    }
  }

  stopSaviourTheme() {
    if (!this.isSaviourMusicPlaying) return;
    try {
      this.isSaviourMusicPlaying = false;
      if (this.musicInterval) {
        clearInterval(this.musicInterval);
        this.musicInterval = null;
      }
      if (this.musicGain && this.ctx) {
        this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.musicGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
        setTimeout(() => {
          try {
            if (this.musicGain) this.musicGain.disconnect();
            if (this.musicFilter) this.musicFilter.disconnect();
          } catch (e) {}
          this.musicGain = null;
          this.musicFilter = null;
        }, 250);
      }
    } catch (e) {
      this.isSaviourMusicPlaying = false;
    }
  }

  toggleSaviourTheme() {
    if (this.isSaviourMusicPlaying) {
      this.stopSaviourTheme();
      return false;
    } else {
      this.startSaviourTheme();
      return true;
    }
  }

  duckMusic(isDucked) {
    if (!this.musicGain || !this.ctx) return;
    try {
      const target = isDucked ? 0.035 : (this.musicTargetGain || 0.16);
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.setTargetAtTime(this.isMuted ? 0 : target, this.ctx.currentTime, 0.08);
    } catch (e) {}
  }
}

export const sound = new SoundEngine();
