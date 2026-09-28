/**
 * Retro 8-bit Web Audio Sound Synthesizer for Tetris
 * No external sound files required; generates retro tones directly via Web Audio API.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private bgmEnabled: boolean = false;
  private bgmTimeoutId: number | null = null;
  private isBgmPlaying: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleSound(enabled?: boolean): boolean {
    this.soundEnabled = enabled !== undefined ? enabled : !this.soundEnabled;
    return this.soundEnabled;
  }

  public isSoundOn(): boolean {
    return this.soundEnabled;
  }

  public isBgmOn(): boolean {
    return this.bgmEnabled;
  }

  public toggleBgm(enabled?: boolean): boolean {
    this.bgmEnabled = enabled !== undefined ? enabled : !this.bgmEnabled;
    if (!this.bgmEnabled) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    return this.bgmEnabled;
  }

  // Play a simple retro tone
  private playTone(freq: number, type: OscillatorType, duration: number, gainValue = 0.1, pitchDecay = 0) {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (pitchDecay !== 0) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, freq + pitchDecay), this.ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio might fail if user hasn't interacted yet
    }
  }

  public playMove() {
    this.playTone(280, 'square', 0.04, 0.05);
  }

  public playRotate() {
    this.playTone(480, 'square', 0.06, 0.07, 100);
  }

  public playDrop() {
    this.playTone(180, 'triangle', 0.08, 0.08, -60);
  }

  public playHardDrop() {
    this.playTone(120, 'square', 0.12, 0.12, -80);
    // Add small white noise punch
    this.playNoise(0.06, 0.08);
  }

  public playHold() {
    this.playTone(350, 'sine', 0.08, 0.08, 150);
  }

  public playLineClear() {
    // 2-tone chime
    this.playTone(523.25, 'square', 0.1, 0.09); // C5
    setTimeout(() => {
      this.playTone(659.25, 'square', 0.14, 0.1); // E5
    }, 80);
  }

  public playTetrisClear() {
    // 4-tone ascending triumph chime
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'square', 0.16, 0.12);
      }, idx * 70);
    });
  }

  public playLevelUp() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.18, 0.12);
      }, idx * 90);
    });
  }

  public playSkinUnlock() {
    // 5-tone triumphant arpeggio fanfare for unlocking a skin
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'square', 0.2, 0.14);
      }, idx * 80);
    });
  }

  public playGameOver() {
    const notes = [400, 360, 320, 260, 200];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.22, 0.12, -30);
      }, idx * 120);
    });
  }

  public playBomb() {
    this.playNoise(0.35, 0.28);
    this.playTone(130, 'sawtooth', 0.35, 0.2, -80);
  }

  public playSlow() {
    this.playTone(550, 'sine', 0.35, 0.15, -300);
  }

  public playMorph() {
    this.playTone(440, 'triangle', 0.08, 0.15);
    setTimeout(() => this.playTone(880, 'square', 0.12, 0.15), 60);
    setTimeout(() => this.playTone(1320, 'sine', 0.18, 0.15), 120);
  }

  public playDrill() {
    this.playNoise(0.22, 0.2);
    this.playTone(260, 'sawtooth', 0.28, 0.15, -120);
  }

  public playItemGain() {
    this.playTone(659.25, 'sine', 0.1, 0.12);
    setTimeout(() => this.playTone(987.77, 'triangle', 0.16, 0.14), 70);
  }

  private playNoise(duration: number, volume: number) {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noise.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch {
      // Audio context catch
    }
  }

  // 8-bit Korobeiniki Retro BGM loop
  public startBgm() {
    if (this.isBgmPlaying || !this.bgmEnabled) return;
    this.isBgmPlaying = true;

    // Melody notes (freq in Hz, duration in 16th beats)
    const melody: [number, number][] = [
      [659.25, 2], [493.88, 1], [523.25, 1], [587.33, 2], [523.25, 1], [493.88, 1],
      [440.00, 2], [440.00, 1], [523.25, 1], [659.25, 2], [587.33, 1], [523.25, 1],
      [493.88, 3], [523.25, 1], [587.33, 2], [659.25, 2],
      [523.25, 2], [440.00, 2], [440.00, 3], [0, 1],
      [587.33, 3], [698.46, 1], [880.00, 2], [783.99, 1], [698.46, 1],
      [659.25, 3], [523.25, 1], [659.25, 2], [587.33, 1], [523.25, 1],
      [493.88, 2], [493.88, 1], [523.25, 1], [587.33, 2], [659.25, 2],
      [523.25, 2], [440.00, 2], [440.00, 3], [0, 1],
    ];

    let noteIdx = 0;
    const stepMs = 155; // tempo

    const playNext = () => {
      if (!this.isBgmPlaying || !this.bgmEnabled) {
        this.isBgmPlaying = false;
        return;
      }
      const [freq, durationSteps] = melody[noteIdx];
      if (freq > 0) {
        this.playTone(freq, 'square', (durationSteps * stepMs) / 1000 * 0.85, 0.025);
      }
      noteIdx = (noteIdx + 1) % melody.length;
      this.bgmTimeoutId = window.setTimeout(playNext, durationSteps * stepMs);
    };

    playNext();
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimeoutId !== null) {
      window.clearTimeout(this.bgmTimeoutId);
      this.bgmTimeoutId = null;
    }
  }
}

export const sound = new SoundController();
