// ============================================================================
// SYSTEM SAVIOUR - INTRO AUDIO TOUR ENGINE
// Spoken narration by Mentor Ada explaining every element of the opening screen
// ============================================================================

import { sound } from './audioEngine';

export const INTRO_TOUR_STEPS = [
  {
    id: 'header',
    elementId: 'intro-header-card',
    badge: 'Step 1 of 5 • Welcome Briefing',
    title: 'Welcome to System Saviour',
    shortDesc: 'Mentor Ada introduces the distributed systems engineering simulator.',
    narration:
      "Welcome to System Saviour! I am Ada, your Principal SRE Lead. In this distributed systems simulator, you will design, scale, and rescue high-traffic cloud infrastructures from devastating real-world outages. Let me give you a quick audio tour of everything on this briefing screen."
  },
  {
    id: 'video',
    elementId: 'intro-video-card',
    badge: 'Step 2 of 5 • Gameplay Walkthrough',
    title: 'Level 1 Video Walkthrough: The Garage Startup',
    shortDesc: 'Watch how to solve Level 1 by adding Redis Cache and passing SLA.',
    narration:
      "Here in the center is the Level 1 walkthrough video. In this first mission, The Garage Startup, your viral social app receives 800 requests per second. The default SQL database chokes under heavy read load. Watch how inserting an in-memory Redis Cache absorbs 75% of reads, keeping P99 latency below 120 milliseconds for a SLA victory!"
  },
  {
    id: 'learning',
    elementId: 'intro-learning-grid',
    badge: 'Step 3 of 5 • Learning Pillars',
    title: 'What You Will Gain By Playing',
    shortDesc: 'Real-world architecture mastery, latency diagnosis, and cost tradeoffs.',
    narration:
      "Below the video are the four core engineering skills you will master: Real-World Architecture Mastery, SLA Latency and Bottleneck Diagnosis, Cloud Cost versus Performance Tradeoffs, and High-Pressure Incident Response under chaos conditions."
  },
  {
    id: 'modes',
    elementId: 'intro-modes-grid',
    badge: 'Step 4 of 5 • Game Modes',
    title: 'Three Playable Game Modes',
    shortDesc: 'Campaign Mode, Survival Wave Mode, and Sandbox Architecture Lab.',
    narration:
      "You can choose between three distinct game modes: Campaign Mode featuring eight progressive real-world outage levels, Survival Wave Mode with Chaos Monkey server crashes, and the Sandbox Architecture Lab for freeform system design with zero budget ceilings."
  },
  {
    id: 'start',
    elementId: 'intro-footer-card',
    badge: 'Step 5 of 5 • Launching Mission',
    title: 'Choosing a Mode & Entering Arena',
    shortDesc: 'Select any game mode card to inspect mission targets or close guide.',
    narration:
      "To start playing, click any game mode above to inspect its mission targets and level briefing, or click Close Guide to enter the system canvas immediately. Let us build battle-hardened architectures together!"
  }
];

class IntroAudioTourManager {
  constructor() {
    this.currentStepIdx = 0;
    this.isPlaying = false;
    this.utterance = null;
    this.listeners = new Set();
    this.isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    this.selectedVoice = null;

    if (this.isSupported) {
      this.initVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initVoices() {
    if (!this.isSupported) return;
    try {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return;

      // Prefer high-quality, natural female English voices for Mentor Ada
      const preferred = voices.find(v => 
        v.lang.startsWith('en') && (
          v.name.includes('Natural') ||
          v.name.includes('Google US English') ||
          v.name.includes('Samantha') ||
          v.name.includes('Jenny') ||
          v.name.includes('Zira') ||
          v.name.includes('Victoria') ||
          v.name.includes('Karen') ||
          v.name.includes('Female')
        )
      );

      this.selectedVoice = preferred || voices.find(v => v.lang.startsWith('en')) || voices[0];
    } catch (e) {}
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn({
      isPlaying: this.isPlaying,
      currentStepIdx: this.currentStepIdx,
      step: INTRO_TOUR_STEPS[this.currentStepIdx]
    }));
  }

  start(stepIndex = 0) {
    if (!this.isSupported) return;
    this.stop();

    // Ensure audio context is running and start Saviour theme music
    sound.ensureContext();
    sound.startSaviourTheme();

    this.currentStepIdx = Math.max(0, Math.min(stepIndex, INTRO_TOUR_STEPS.length - 1));
    this.isPlaying = true;
    this.notify();
    this.speakCurrentStep();
  }

  speakCurrentStep() {
    if (!this.isSupported || !this.isPlaying) return;

    try {
      window.speechSynthesis.cancel();
      const step = INTRO_TOUR_STEPS[this.currentStepIdx];
      if (!step) {
        this.stop();
        return;
      }

      // Smoothly highlight and scroll element into view
      const el = document.getElementById(step.elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      this.utterance = new SpeechSynthesisUtterance(step.narration);
      if (this.selectedVoice) {
        this.utterance.voice = this.selectedVoice;
      }
      this.utterance.rate = 0.98; // natural articulate pace
      this.utterance.pitch = 1.05; // warm, engaging tone

      this.utterance.onstart = () => {
        sound.duckMusic(true); // Lower background music volume while Ada speaks
      };

      this.utterance.onend = () => {
        sound.duckMusic(false); // Restore background music volume
        if (!this.isPlaying) return;

        // Auto-advance to next step after brief pause
        if (this.currentStepIdx < INTRO_TOUR_STEPS.length - 1) {
          setTimeout(() => {
            if (this.isPlaying) {
              this.currentStepIdx++;
              this.notify();
              this.speakCurrentStep();
            }
          }, 800);
        } else {
          // Finished all steps
          this.isPlaying = false;
          this.notify();
        }
      };

      this.utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        sound.duckMusic(false);
      };

      window.speechSynthesis.speak(this.utterance);
    } catch (e) {
      console.warn('Speech synthesis exception:', e);
      sound.duckMusic(false);
    }
  }

  pause() {
    if (!this.isSupported) return;
    this.isPlaying = false;
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
    sound.duckMusic(false);
    this.notify();
  }

  resume() {
    if (!this.isSupported) return;
    this.isPlaying = true;
    sound.ensureContext();
    sound.startSaviourTheme();
    this.notify();
    this.speakCurrentStep();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  next() {
    if (this.currentStepIdx < INTRO_TOUR_STEPS.length - 1) {
      this.currentStepIdx++;
      this.isPlaying = true;
      this.notify();
      this.speakCurrentStep();
    }
  }

  prev() {
    if (this.currentStepIdx > 0) {
      this.currentStepIdx--;
      this.isPlaying = true;
      this.notify();
      this.speakCurrentStep();
    }
  }

  jumpTo(stepIndex) {
    this.currentStepIdx = Math.max(0, Math.min(stepIndex, INTRO_TOUR_STEPS.length - 1));
    this.isPlaying = true;
    this.notify();
    this.speakCurrentStep();
  }

  stop() {
    this.isPlaying = false;
    try {
      if (this.isSupported) {
        window.speechSynthesis.cancel();
      }
    } catch (e) {}
    sound.duckMusic(false);
    this.notify();
  }
}

export const introAudioTour = new IntroAudioTourManager();
