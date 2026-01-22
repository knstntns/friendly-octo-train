// Audio Engine for playing notes and chords

import { getNoteIndex } from './MusicTheory.js';

export class AudioEngine {
  constructor(options = {}) {
    this.audioContext = null;
    this.enabled = options.enabled !== false;
    this.masterVolume = options.volume || 0.5;

    // Chord playback settings
    this.arpeggioDelay = options.arpeggioDelay || 50; // ms between notes in arpeggio
    this.noteDuration = options.noteDuration || 1.5; // seconds
    this.chordDuration = options.chordDuration || 2.0; // seconds for full chord
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  init() {
    if (this.audioContext) return true;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      return true;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
      this.enabled = false;
      return false;
    }
  }

  /**
   * Ensure audio context is ready
   */
  ensureReady() {
    if (!this.enabled) return false;

    if (!this.audioContext) {
      this.init();
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    return !!this.audioContext;
  }

  /**
   * Toggle audio on/off
   */
  toggle(enabled) {
    this.enabled = enabled;
    return this.enabled;
  }

  /**
   * Set master volume
   */
  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Play a single note by frequency
   */
  playFrequency(frequency, options = {}) {
    if (!this.ensureReady()) return;

    const {
      duration = this.noteDuration,
      volume = this.masterVolume,
      delay = 0,
      waveType = 'triangle'
    } = options;

    const now = this.audioContext.currentTime + delay;

    // Create oscillator
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();

    // Guitar-like waveform
    oscillator.type = waveType;
    oscillator.frequency.setValueAtTime(frequency, now);

    // Low-pass filter for warmer tone
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(2500, now);
    filterNode.Q.setValueAtTime(1, now);

    // ADSR envelope for plucked string sound
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume * 0.6, now + 0.01); // Attack
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.3, now + 0.1); // Decay
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration); // Release

    // Connect nodes
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Play
    oscillator.start(now);
    oscillator.stop(now + duration);

    return { oscillator, gainNode };
  }

  /**
   * Play a note by name (e.g., "C", "F#", "Bb")
   */
  playNote(noteName, octave = 4, options = {}) {
    const frequency = this.noteToFrequency(noteName, octave);
    return this.playFrequency(frequency, options);
  }

  /**
   * Play a chord (all notes together or arpeggiated)
   */
  playChord(notes, options = {}) {
    if (!this.ensureReady()) return;
    if (!notes || notes.length === 0) return;

    const {
      arpeggio = false,
      arpeggioDelay = this.arpeggioDelay,
      duration = this.chordDuration,
      volume = this.masterVolume,
      baseOctave = 3
    } = options;

    // Normalize notes to include octaves
    const notesWithOctaves = this.assignOctaves(notes, baseOctave);

    if (arpeggio) {
      // Play notes one after another
      notesWithOctaves.forEach((note, index) => {
        const delay = (index * arpeggioDelay) / 1000; // Convert ms to seconds
        this.playNote(note.name, note.octave, {
          delay,
          duration: duration - delay,
          volume: volume * 0.7 // Slightly softer for arpeggio
        });
      });
    } else {
      // Play all notes together (slightly staggered for natural feel)
      notesWithOctaves.forEach((note, index) => {
        const delay = index * 0.008; // Very slight stagger (8ms)
        this.playNote(note.name, note.octave, {
          delay,
          duration,
          volume: volume * 0.5 // Softer when playing together
        });
      });
    }
  }

  /**
   * Play a chord progression
   */
  playProgression(chords, options = {}) {
    if (!this.ensureReady()) return;
    if (!chords || chords.length === 0) return;

    const {
      tempo = 120, // BPM
      beatsPerChord = 2,
      arpeggio = false,
      onChordStart = null,
      onComplete = null
    } = options;

    const beatDuration = 60 / tempo; // seconds per beat
    const chordDuration = beatDuration * beatsPerChord;

    let currentIndex = 0;

    const playNextChord = () => {
      if (currentIndex >= chords.length) {
        if (onComplete) onComplete();
        return;
      }

      const chord = chords[currentIndex];

      if (onChordStart) {
        onChordStart(currentIndex, chord);
      }

      // Play the chord
      if (chord.notes && chord.notes.length > 0) {
        this.playChord(chord.notes, {
          arpeggio,
          duration: chordDuration * 0.9, // Slight gap between chords
          baseOctave: 3
        });
      }

      currentIndex++;

      // Schedule next chord
      if (currentIndex < chords.length) {
        this.progressionTimeout = setTimeout(playNextChord, chordDuration * 1000);
      } else {
        // Wait for last chord to finish then call onComplete
        this.progressionTimeout = setTimeout(() => {
          if (onComplete) onComplete();
        }, chordDuration * 1000);
      }
    };

    // Start playing
    playNextChord();

    // Return stop function
    return () => {
      if (this.progressionTimeout) {
        clearTimeout(this.progressionTimeout);
        this.progressionTimeout = null;
      }
    };
  }

  /**
   * Stop any playing progression
   */
  stopProgression() {
    if (this.progressionTimeout) {
      clearTimeout(this.progressionTimeout);
      this.progressionTimeout = null;
    }
  }

  /**
   * Assign octaves to notes for proper voicing
   */
  assignOctaves(notes, baseOctave = 3) {
    const result = [];
    let currentOctave = baseOctave;
    let lastNoteIndex = -1;

    for (const note of notes) {
      const noteName = typeof note === 'string' ? note : note.name || note;
      const noteIndex = getNoteIndex(noteName);

      // If note is lower than previous, bump up octave
      if (lastNoteIndex !== -1 && noteIndex <= lastNoteIndex) {
        currentOctave++;
      }

      result.push({
        name: noteName,
        octave: currentOctave
      });

      lastNoteIndex = noteIndex;
    }

    return result;
  }

  /**
   * Convert note name to frequency
   */
  noteToFrequency(noteName, octave = 4) {
    // A4 = 440 Hz
    const A4 = 440;
    const noteIndex = getNoteIndex(noteName);

    // Calculate semitones from A4 (A = 9 in our index, 0 = C)
    const semitonesFromA4 = noteIndex - 9 + (octave - 4) * 12;

    return A4 * Math.pow(2, semitonesFromA4 / 12);
  }

  /**
   * Calculate frequency for a guitar position
   */
  getGuitarFrequency(string, fret) {
    // Standard guitar tuning frequencies (high E to low E)
    // String 1 = high E (E4), String 6 = low E (E2)
    const openStringFrequencies = [329.63, 246.94, 196.00, 146.83, 110.00, 82.41];

    const stringIndex = string - 1;
    const baseFreq = openStringFrequencies[stringIndex] || 196.00;

    // Each fret is a semitone
    return baseFreq * Math.pow(2, fret / 12);
  }

  /**
   * Play a note at a guitar position
   */
  playGuitarNote(string, fret, options = {}) {
    const frequency = this.getGuitarFrequency(string, fret);
    return this.playFrequency(frequency, options);
  }
}

// Singleton instance for shared use
let audioEngineInstance = null;

export function getAudioEngine() {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine();
  }
  return audioEngineInstance;
}

export default AudioEngine;
