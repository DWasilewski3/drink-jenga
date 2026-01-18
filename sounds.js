// Drinking Jenga - Sound System
// Uses Web Audio API to generate sounds without external files

class SoundSystem {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.5;
  }

  // Initialize audio context (must be called after user interaction)
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Master volume control
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
  }

  // Toggle sound on/off
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Create a gain node for volume control
  createGain(volume = this.volume) {
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume * this.volume;
    gainNode.connect(this.audioContext.destination);
    return gainNode;
  }

  // ===================================
  // Sound Generators
  // ===================================

  // Tick sound for countdowns
  tick() {
    if (!this.enabled || !this.audioContext) return;
    
    const osc = this.audioContext.createOscillator();
    const gain = this.createGain(0.3);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.3 * this.volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    osc.connect(gain);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  // Explosion sound for fuse timer
  explosion() {
    if (!this.enabled || !this.audioContext) return;

    // White noise burst
    const bufferSize = this.audioContext.sampleRate * 0.5;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    // Low frequency boom
    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.3);
    
    const noiseGain = this.createGain(0.6);
    const oscGain = this.createGain(0.8);
    
    noiseGain.gain.setValueAtTime(0.6 * this.volume, this.audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    oscGain.gain.setValueAtTime(0.8 * this.volume, this.audioContext.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
    
    noise.connect(noiseGain);
    osc.connect(oscGain);
    
    noise.start();
    osc.start();
    noise.stop(this.audioContext.currentTime + 0.5);
    osc.stop(this.audioContext.currentTime + 0.4);
  }

  // Buzzer sound for time's up / fail
  buzzer() {
    if (!this.enabled || !this.audioContext) return;

    const osc1 = this.audioContext.createOscillator();
    const osc2 = this.audioContext.createOscillator();
    const gain = this.createGain(0.4);
    
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.value = 150;
    osc2.frequency.value = 153; // Slight detune for harshness
    
    gain.gain.setValueAtTime(0.4 * this.volume, this.audioContext.currentTime);
    gain.gain.setValueAtTime(0.4 * this.volume, this.audioContext.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    osc1.connect(gain);
    osc2.connect(gain);
    
    osc1.start();
    osc2.start();
    osc1.stop(this.audioContext.currentTime + 0.5);
    osc2.stop(this.audioContext.currentTime + 0.5);
  }

  // Chime sound for success / completion
  chime() {
    if (!this.enabled || !this.audioContext) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    notes.forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.createGain(0.3);
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const startTime = this.audioContext.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3 * this.volume, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
      
      osc.connect(gain);
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  // Drumroll for spinner suspense
  drumroll(duration = 2) {
    if (!this.enabled || !this.audioContext) return;

    const interval = 50; // ms between hits
    const hits = Math.floor(duration * 1000 / interval);
    
    for (let i = 0; i < hits; i++) {
      const time = this.audioContext.currentTime + (i * interval / 1000);
      
      // Create noise burst for each hit
      const bufferSize = this.audioContext.sampleRate * 0.03;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / bufferSize, 3);
      }
      
      const noise = this.audioContext.createBufferSource();
      noise.buffer = buffer;
      
      const gain = this.audioContext.createGain();
      // Crescendo effect
      const volumeRamp = 0.1 + (i / hits) * 0.3;
      gain.gain.value = volumeRamp * this.volume;
      
      gain.connect(this.audioContext.destination);
      noise.connect(gain);
      noise.start(time);
    }
  }

  // Fanfare for winner announcement
  fanfare() {
    if (!this.enabled || !this.audioContext) return;

    // Triumphant chord progression
    const chords = [
      [261.63, 329.63, 392.00], // C major
      [293.66, 369.99, 440.00], // D major
      [329.63, 415.30, 493.88], // E major
      [349.23, 440.00, 523.25], // F major
      [392.00, 493.88, 587.33], // G major
    ];
    
    chords.forEach((chord, chordIndex) => {
      const startTime = this.audioContext.currentTime + chordIndex * 0.15;
      
      chord.forEach((freq) => {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2 * this.volume, startTime + 0.02);
        gain.gain.setValueAtTime(0.2 * this.volume, startTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
        
        gain.connect(this.audioContext.destination);
        osc.connect(gain);
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    });
  }

  // Spinner click sound (for each segment pass)
  spinnerClick() {
    if (!this.enabled || !this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.createGain(0.2);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.02);
    
    gain.gain.setValueAtTime(0.2 * this.volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.03);
    
    osc.connect(gain);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.03);
  }

  // Fuse sizzle sound (continuous)
  startFuseSizzle() {
    if (!this.enabled || !this.audioContext) return null;

    // Create brown noise for sizzle
    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Amplify
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    // High-pass filter for sizzle effect
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 3000;
    
    const gain = this.audioContext.createGain();
    gain.gain.value = 0.15 * this.volume;
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    
    noise.start();
    
    // Return control object
    return {
      stop: () => {
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        setTimeout(() => noise.stop(), 100);
      },
      intensify: (factor) => {
        gain.gain.value = 0.15 * this.volume * factor;
        filter.frequency.value = 3000 + (factor * 2000);
      }
    };
  }

  // Vote sound (selection)
  vote() {
    if (!this.enabled || !this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.createGain(0.25);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
    osc.frequency.linearRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.25 * this.volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
    
    osc.connect(gain);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.15);
  }

  // Countdown beep (final 3 seconds)
  countdownBeep(isLast = false) {
    if (!this.enabled || !this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.createGain(0.4);
    
    osc.type = 'sine';
    osc.frequency.value = isLast ? 880 : 440; // Higher pitch for final beep
    
    const duration = isLast ? 0.3 : 0.15;
    gain.gain.setValueAtTime(0.4 * this.volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    osc.connect(gain);
    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }

  // Card flip sound
  cardFlip() {
    if (!this.enabled || !this.audioContext) return;

    const bufferSize = this.audioContext.sampleRate * 0.1;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / this.audioContext.sampleRate;
      data[i] = Math.sin(2000 * Math.PI * t * Math.exp(-t * 30)) * Math.exp(-t * 20);
    }
    
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    
    const gain = this.createGain(0.3);
    source.connect(gain);
    source.start();
  }
}

// Create global sound instance
const sounds = new SoundSystem();

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { sounds, SoundSystem };
}

