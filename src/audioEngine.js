// ============================================================================
// SYSTEM SAVIOUR - AUDIO ENGINE
// Cinematic Warrior Soundtrack + Procedural Web Audio FX
// ============================================================================

import warriorThemeMp3 from './assets/warrior_theme.mp3';

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientOsc1 = null;
    this.ambientOsc2 = null;
    this.ambientGain = null;
    this.isAmbientPlaying = false;
    this._stopDroneTimeout = null;
    this.musicGain = null;
    this.musicFilter = null;
    this.musicInterval = null;
    this.warriorAudio = null;
    this.warriorSourceNode = null;
    this.analyser = null;
    this.analyserDataArray = null;
    this.currentPlaybackRate = 1.0;
    this.musicTargetGain = 0.75; // High, audible, energetic warrior theme volume
    this.duckedGain = 0.30;      // Background volume during Ada speech (keeps music clearly audible!)
    this.isDucked = false;
    this._fadeInterval = null;
    this._pendingAutoplay = true;
    this._needsUnmuteOnGesture = false;

    // Load persisted preferences: Sound defaults to ON (false), Music defaults to ON (true)
    let savedMuted = false;
    let savedMusic = true;
    try {
      if (typeof localStorage !== 'undefined') {
        const m = localStorage.getItem('systemsaviour_sound_muted');
        if (m !== null) savedMuted = m === 'true';
        const mus = localStorage.getItem('systemsaviour_music_enabled');
        if (mus !== null) savedMusic = mus === 'true';
      }
    } catch (e) {}

    this.isMuted = savedMuted;
    this.isSaviourMusicPlaying = savedMusic;
  }

  ensureContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.95, this.ctx.currentTime);
        
        // Real-time audio analyser for dynamic visualizer
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 64;
        this.analyser.smoothingTimeConstant = 0.8;
        this.analyserDataArray = new Uint8Array(this.analyser.frequencyBinCount);

        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
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
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('systemsaviour_sound_muted', this.isMuted.toString());
      }
    } catch (e) {}

    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.95;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }

    if (this.warriorAudio) {
      if (this.isMuted) {
        this.warriorAudio.volume = 0;
        this.warriorAudio.muted = true;
      } else {
        this.warriorAudio.muted = false;
        // Only unmute warrior audio volume if music is enabled by the user!
        if (this.isSaviourMusicPlaying) {
          const activeVol = this.isDucked ? this.duckedGain : this.musicTargetGain;
          this.warriorAudio.volume = activeVol;
          if (this.warriorAudio.paused) {
            this.warriorAudio.play().catch(() => {});
          }
        } else {
          this.warriorAudio.volume = 0;
        }
      }
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

  // 11b. Crunchy Snack Munch
  playSnackCrunch() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.08);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2600, now);
      filter.Q.setValueAtTime(1.8, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(now);
    } catch (e) {}
  }

  // 11c. Angry Anime Manager Yell
  playManagerYell() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.22);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.23);
    } catch (e) {}
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
    if (this._stopDroneTimeout) {
      clearTimeout(this._stopDroneTimeout);
      this._stopDroneTimeout = null;
    }
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
    if (this._stopDroneTimeout) {
      clearTimeout(this._stopDroneTimeout);
    }
    try {
      if (this.ambientGain && this.ctx) {
        this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
      }
      this._stopDroneTimeout = setTimeout(() => {
        try {
          if (this.ambientOsc1) this.ambientOsc1.stop();
          if (this.ambientOsc2) this.ambientOsc2.stop();
        } catch (e) {}
        this.ambientOsc1 = null;
        this.ambientOsc2 = null;
        this.ambientGain = null;
        this.isAmbientPlaying = false;
        this._stopDroneTimeout = null;
      }, 200);
    } catch (e) {
      this.isAmbientPlaying = false;
      this._stopDroneTimeout = null;
    }
  }

  // ============================================================================
  // 15. WARRIOR BATTLE THEME BACKGROUND MUSIC (High-energy cinematic soundtrack)
  // ============================================================================
  initWarriorAudio() {
    if (!this.warriorAudio && typeof window !== 'undefined') {
      try {
        this.warriorAudio = new Audio(warriorThemeMp3);
        this.warriorAudio.loop = true;
        this.warriorAudio.preload = 'auto';
        this.warriorAudio.volume = this.isMuted ? 0 : (this.isDucked ? this.duckedGain : this.musicTargetGain);
        this.warriorAudio.playbackRate = this.currentPlaybackRate || 1.0;

        if (this.ctx && !this.warriorSourceNode) {
          try {
            this.warriorSourceNode = this.ctx.createMediaElementSource(this.warriorAudio);
            this.warriorSourceNode.connect(this.masterGain);
          } catch (e) {
            // Handled gracefully if browser policy forbids re-routing
          }
        }

        this.warriorAudio.onerror = (e) => {
          console.warn('Primary warrior audio load failed, falling back to public path:', e);
          if (!this.warriorAudio._triedFallback) {
            this.warriorAudio._triedFallback = true;
            this.warriorAudio.src = (import.meta.env?.BASE_URL || '/') + 'warrior_theme.mp3';
            this.warriorAudio.load();
            if (this.isSaviourMusicPlaying && !this.isMuted) {
              this.warriorAudio.play().catch(() => {});
            }
          }
        };
      } catch (e) {
        console.warn('Warrior audio initialization exception:', e);
      }
    }
  }

  fadeWarriorVolume(targetVol, durationMs = 260) {
    if (!this.warriorAudio) return;
    if (this.isMuted || !this.isSaviourMusicPlaying) {
      this.warriorAudio.volume = 0;
      return;
    }
    const startVol = this.warriorAudio.volume;
    const startTime = performance.now();

    if (this._fadeInterval) {
      clearInterval(this._fadeInterval);
      this._fadeInterval = null;
    }

    this._fadeInterval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
      const current = startVol + (targetVol - startVol) * ease;
      if (this.warriorAudio) {
        this.warriorAudio.volume = Math.max(0, Math.min(1, current));
      }
      if (progress >= 1) {
        clearInterval(this._fadeInterval);
        this._fadeInterval = null;
      }
    }, 20);
  }

  startSaviourTheme() {
    this.initWarriorAudio();
    this.isSaviourMusicPlaying = true;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('systemsaviour_music_enabled', 'true');
      }
    } catch (e) {}

    if (this.warriorAudio) {
      const activeVolume = this.isMuted ? 0 : (this.isDucked ? this.duckedGain : this.musicTargetGain);
      this.warriorAudio.volume = activeVolume;
      this.warriorAudio.muted = this.isMuted;

      if (!this.isMuted) {
        const playPromise = this.warriorAudio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this._pendingAutoplay = false;
              this._needsUnmuteOnGesture = false;
            })
            .catch((err) => {
              this._pendingAutoplay = true;
              this._needsUnmuteOnGesture = true;
              try {
                this.warriorAudio.muted = true;
                this.warriorAudio.play().catch(() => {});
              } catch (e) {}
            });
        }
      }
    }
  }

  unlockAudio() {
    this.ensureContext();
    this.initWarriorAudio();

    // Respect user's explicit music choice: only play music if user hasn't turned it off!
    if (this.isSaviourMusicPlaying && !this.isMuted && this.warriorAudio) {
      this.warriorAudio.muted = false;
      this.warriorAudio.volume = this.isDucked ? this.duckedGain : this.musicTargetGain;
      this._needsUnmuteOnGesture = false;
      this._pendingAutoplay = false;
      this.warriorAudio.play().catch(() => {});
    }
  }

  isMusicActive() {
    return !!(this.warriorAudio && !this.warriorAudio.paused && !this.warriorAudio.muted && this.warriorAudio.volume > 0);
  }

  stopSaviourTheme() {
    this._pendingAutoplay = false;
    this._needsUnmuteOnGesture = false;
    this.isSaviourMusicPlaying = false;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('systemsaviour_music_enabled', 'false');
      }
    } catch (e) {}

    if (this.warriorAudio) {
      this.fadeWarriorVolume(0, 200);
      setTimeout(() => {
        try {
          if (!this.isSaviourMusicPlaying && this.warriorAudio) {
            this.warriorAudio.pause();
          }
        } catch (e) {}
      }, 210);
    }
  }

  toggleSaviourTheme() {
    this.ensureContext();
    this.initWarriorAudio();
    if (this.isSaviourMusicPlaying) {
      this.stopSaviourTheme();
      return false;
    } else {
      this.startSaviourTheme();
      return true;
    }
  }

  duckMusic(isDucked) {
    this.isDucked = isDucked;
    if (!this.isSaviourMusicPlaying || !this.warriorAudio) return;
    if (this.isMuted) {
      this.warriorAudio.volume = 0;
      return;
    }

    // High energetic volume when Ada is not speaking (0.75)
    // Audibly ducked to 0.30 when Ada IS speaking so player still clearly hears the warrior beat!
    const target = isDucked ? this.duckedGain : this.musicTargetGain;
    this.fadeWarriorVolume(target, 280);
  }

  // ============================================================================
  // 16. ADAPTIVE TRAFFIC BEAT ENGINE & REAL-TIME AUDIO VISUALIZER
  // ============================================================================
  setAdaptiveTrafficBeat(loadRatio = 0.5, isIncident = false, isRunning = false) {
    let targetRate = 1.0;
    if (isIncident) {
      targetRate = 1.18; // Urgent adrenaline rush during Chaos Monkey / Red Alert!
    } else if (isRunning) {
      if (loadRatio > 0.85) {
        targetRate = 1.12; // High-traffic surge
      } else if (loadRatio > 0.50) {
        targetRate = 1.06; // Active scaling
      } else {
        targetRate = 1.0;
      }
    } else {
      targetRate = 1.0; // Normal idle
    }

    // Smoothly interpolate current playback rate towards target
    const current = this.currentPlaybackRate || 1.0;
    const next = current + (targetRate - current) * 0.18;
    this.currentPlaybackRate = next;

    if (this.warriorAudio) {
      try {
        this.warriorAudio.playbackRate = Math.max(0.95, Math.min(1.22, next));
      } catch (e) {}
    }

    // Modulate ambient drone pitch if running
    if (this.ambientOsc1 && this.ctx) {
      const dronePitch = isIncident ? 65 : 55 + (loadRatio * 15);
      this.ambientOsc1.frequency.setTargetAtTime(dronePitch, this.ctx.currentTime, 0.2);
    }
  }

  getBeatInfo() {
    const rate = this.currentPlaybackRate || 1.0;
    const bpm = Math.round(124 * rate);
    let intensity = 'NORMAL';
    if (rate >= 1.15) intensity = 'CHAOS_P0';
    else if (rate >= 1.10) intensity = 'OVERLOAD';
    else if (rate >= 1.04) intensity = 'SURGE';

    return {
      bpm,
      playbackRate: rate.toFixed(2),
      intensity
    };
  }

  isAudible() {
    return !this.isMuted && (this.isMusicActive() || this.isAmbientPlaying);
  }

  getVisualizerData() {
    // If Web Audio analyser node is hooked up and receiving frequency spectrum data
    if (this.analyser && this.analyserDataArray) {
      this.analyser.getByteFrequencyData(this.analyserDataArray);
      let sum = 0;
      for (let i = 0; i < this.analyserDataArray.length; i++) {
        sum += this.analyserDataArray[i];
      }
      if (sum > 12) {
        // Sample 5 frequency bands: [sub-bass, bass, mid, high-mid, treble]
        const step = Math.floor(this.analyserDataArray.length / 5);
        const bands = [];
        for (let b = 0; b < 5; b++) {
          let bandSum = 0;
          for (let k = 0; k < step; k++) {
            bandSum += this.analyserDataArray[b * step + k] || 0;
          }
          const avg = bandSum / step / 255;
          bands.push(Math.max(0.12, Math.min(1.0, avg * 1.6)));
        }
        return bands;
      }
    }

    // Dynamic rhythm fallback: pulse in sync with the current playback tempo and traffic beat
    const now = performance.now() * 0.005;
    const rate = this.currentPlaybackRate || 1.0;
    const isAudible = (this.isMusicActive() || this.isAmbientPlaying) && !this.isMuted;
    const baseFloor = isAudible ? 0.32 : 0.08;
    const amplitude = isAudible ? 0.65 : 0.08;

    return [
      baseFloor + amplitude * Math.abs(Math.sin(now * 1.8 * rate)),
      baseFloor + amplitude * Math.abs(Math.sin(now * 2.5 * rate + 0.9)),
      baseFloor + amplitude * Math.abs(Math.cos(now * 3.2 * rate + 1.8)),
      baseFloor + amplitude * Math.abs(Math.sin(now * 2.8 * rate + 2.7)),
      baseFloor + amplitude * Math.abs(Math.cos(now * 4.1 * rate + 3.6))
    ].map(v => Math.max(0.1, Math.min(1.0, v)));
  }
}

export const sound = new SoundEngine();
