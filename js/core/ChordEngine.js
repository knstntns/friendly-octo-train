// Chord harmonization and generation engine

import { CHORD_QUALITIES } from '../data/constants.js';
import { transposeNote, getInterval, getNoteIndex } from './MusicTheory.js';

export class ChordEngine {
  constructor() {
    this.currentChords = [];
  }

  /**
   * Harmonize a scale with triads
   */
  harmonizeTriads(scale) {
    if (!scale || !scale.notes || scale.notes.length < 3) {
      console.error('Invalid scale for harmonization');
      return [];
    }

    const chords = [];
    const scaleLength = scale.notes.length;

    scale.notes.forEach((root, index) => {
      // Build triad using scale degrees (1-3-5 pattern)
      const thirdIndex = (index + 2) % scaleLength;
      const fifthIndex = (index + 4) % scaleLength;

      const third = scale.notes[thirdIndex];
      const fifth = scale.notes[fifthIndex];

      const quality = this.determineTriadQuality(root, third, fifth);
      const romanNumeral = this.getRomanNumeral(index + 1, quality);

      chords.push({
        root: root,
        notes: [root, third, fifth],
        quality: quality,
        symbol: this.getChordSymbol(root, quality),
        degree: romanNumeral,
        scaleDegree: index + 1,
        type: 'triad'
      });
    });

    this.currentChords = chords;
    return chords;
  }

  /**
   * Harmonize a scale with 7th chords
   */
  harmonizeSeventhChords(scale) {
    if (!scale || !scale.notes || scale.notes.length < 4) {
      console.error('Invalid scale for seventh chord harmonization');
      return [];
    }

    const chords = [];
    const scaleLength = scale.notes.length;

    scale.notes.forEach((root, index) => {
      // Build seventh chord using scale degrees (1-3-5-7 pattern)
      const thirdIndex = (index + 2) % scaleLength;
      const fifthIndex = (index + 4) % scaleLength;
      const seventhIndex = (index + 6) % scaleLength;

      const third = scale.notes[thirdIndex];
      const fifth = scale.notes[fifthIndex];
      const seventh = scale.notes[seventhIndex];

      const quality = this.determineSeventhQuality(root, third, fifth, seventh);
      const romanNumeral = this.getRomanNumeral(index + 1, quality);

      chords.push({
        root: root,
        notes: [root, third, fifth, seventh],
        quality: quality,
        symbol: this.getChordSymbol(root, quality),
        degree: romanNumeral,
        scaleDegree: index + 1,
        type: 'seventh'
      });
    });

    return chords;
  }

  /**
   * Harmonize with both triads and seventh chords
   */
  harmonize(scale, includeSevenths = true) {
    const triads = this.harmonizeTriads(scale);

    if (includeSevenths) {
      const sevenths = this.harmonizeSeventhChords(scale);
      return { triads, sevenths };
    }

    return { triads };
  }

  /**
   * Determine triad quality (major, minor, diminished, augmented)
   */
  determineTriadQuality(root, third, fifth) {
    const thirdInterval = getInterval(root, third);
    const fifthInterval = getInterval(root, fifth);

    if (thirdInterval === 4 && fifthInterval === 7) return 'major';
    if (thirdInterval === 3 && fifthInterval === 7) return 'minor';
    if (thirdInterval === 3 && fifthInterval === 6) return 'diminished';
    if (thirdInterval === 4 && fifthInterval === 8) return 'augmented';

    return 'unknown';
  }

  /**
   * Determine seventh chord quality
   */
  determineSeventhQuality(root, third, fifth, seventh) {
    const thirdInterval = getInterval(root, third);
    const fifthInterval = getInterval(root, fifth);
    const seventhInterval = getInterval(root, seventh);

    // Major 7th chord (maj7)
    if (thirdInterval === 4 && fifthInterval === 7 && seventhInterval === 11) {
      return 'major7';
    }

    // Minor 7th chord (m7)
    if (thirdInterval === 3 && fifthInterval === 7 && seventhInterval === 10) {
      return 'minor7';
    }

    // Dominant 7th chord (7)
    if (thirdInterval === 4 && fifthInterval === 7 && seventhInterval === 10) {
      return 'dominant7';
    }

    // Half-diminished 7th chord (m7b5)
    if (thirdInterval === 3 && fifthInterval === 6 && seventhInterval === 10) {
      return 'halfDiminished7';
    }

    // Fully diminished 7th chord (dim7)
    if (thirdInterval === 3 && fifthInterval === 6 && seventhInterval === 9) {
      return 'diminished7';
    }

    // Minor-major 7th chord (mMaj7)
    if (thirdInterval === 3 && fifthInterval === 7 && seventhInterval === 11) {
      return 'minorMajor7';
    }

    // Augmented 7th chord (aug7)
    if (thirdInterval === 4 && fifthInterval === 8 && seventhInterval === 10) {
      return 'augmented7';
    }

    return 'unknown';
  }

  /**
   * Get chord symbol (e.g., "Cmaj7", "Dm", "Bdim")
   */
  getChordSymbol(root, quality) {
    const qualitySymbols = {
      major: '',
      minor: 'm',
      diminished: 'dim',
      augmented: 'aug',
      major7: 'maj7',
      minor7: 'm7',
      dominant7: '7',
      diminished7: 'dim7',
      halfDiminished7: 'm7♭5',
      augmented7: 'aug7',
      minorMajor7: 'mMaj7'
    };

    return root + (qualitySymbols[quality] || '');
  }

  /**
   * Get Roman numeral for chord degree
   */
  getRomanNumeral(degree, quality) {
    const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    const baseNumeral = numerals[degree - 1] || '';

    // Lowercase for minor and diminished
    if (quality.includes('minor') || quality.includes('diminished')) {
      return baseNumeral.toLowerCase();
    }

    return baseNumeral;
  }

  /**
   * Get common chord progressions for a scale
   */
  getCommonProgressions(scale) {
    const triads = this.harmonizeTriads(scale);

    const progressions = [
      {
        name: 'I-IV-V',
        description: 'Classic progression',
        chords: [triads[0], triads[3], triads[4]]
      },
      {
        name: 'I-V-vi-IV',
        description: 'Pop progression',
        chords: [triads[0], triads[4], triads[5], triads[3]]
      },
      {
        name: 'ii-V-I',
        description: 'Jazz progression',
        chords: [triads[1], triads[4], triads[0]]
      },
      {
        name: 'I-vi-IV-V',
        description: '50s progression',
        chords: [triads[0], triads[5], triads[3], triads[4]]
      },
      {
        name: 'vi-IV-I-V',
        description: 'Sensitive progression',
        chords: [triads[5], triads[3], triads[0], triads[4]]
      },
      {
        name: 'I-IV-vi-V',
        description: 'Alternative pop',
        chords: [triads[0], triads[3], triads[5], triads[4]]
      }
    ];

    return progressions;
  }

  /**
   * Generate a chord from a formula (e.g., [0, 4, 7] for major triad)
   */
  generateChordFromFormula(root, formula) {
    return formula.map(interval => transposeNote(root, interval));
  }

  /**
   * Get chord extensions (9th, 11th, 13th)
   */
  extendChord(chord, extensions = []) {
    const extendedNotes = [...chord.notes];

    extensions.forEach(ext => {
      let interval;
      switch(ext) {
        case 9:
          interval = 14; // 2 semitones + octave
          break;
        case 11:
          interval = 17; // 5 semitones + octave
          break;
        case 13:
          interval = 21; // 9 semitones + octave
          break;
        default:
          return;
      }

      const extendedNote = transposeNote(chord.root, interval % 12);
      extendedNotes.push(extendedNote);
    });

    return {
      ...chord,
      notes: extendedNotes,
      extensions: extensions
    };
  }

  /**
   * Get all chords that contain a specific note
   */
  getChordsContainingNote(note, chords = null) {
    const chordsToSearch = chords || this.currentChords;

    return chordsToSearch.filter(chord =>
      chord.notes.some(chordNote =>
        getNoteIndex(chordNote) === getNoteIndex(note)
      )
    );
  }

  /**
   * Analyze chord tones for a melody note
   */
  analyzeChordTone(note, chord) {
    const noteIndex = getNoteIndex(note);
    const chordToneIndex = chord.notes.findIndex(
      chordNote => getNoteIndex(chordNote) === noteIndex
    );

    if (chordToneIndex === -1) return null;

    const toneNames = ['root', 'third', 'fifth', 'seventh', 'ninth', 'eleventh', 'thirteenth'];
    return {
      toneName: toneNames[chordToneIndex] || 'extension',
      position: chordToneIndex + 1
    };
  }

  /**
   * Get diatonic chord substitutions
   */
  getSubstitutions(chord, scale) {
    const triads = this.harmonizeTriads(scale);
    const substitutions = [];

    // Find chords that share at least 2 notes with the target chord
    triads.forEach(triad => {
      if (triad.root === chord.root) return; // Skip the same chord

      const sharedNotes = chord.notes.filter(note =>
        triad.notes.some(triadNote =>
          getNoteIndex(triadNote) === getNoteIndex(note)
        )
      );

      if (sharedNotes.length >= 2) {
        substitutions.push({
          chord: triad,
          sharedNotes: sharedNotes.length,
          type: sharedNotes.length === 2 ? 'common tone' : 'strong'
        });
      }
    });

    return substitutions;
  }
}

export default ChordEngine;
