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
   * Generate secondary dominants (V/ii, V/iii, V/iv, V/v, V/vi, V/vii)
   * These are dominant 7th chords that resolve to each scale degree
   */
  getSecondaryDominants(scale) {
    if (!scale || !scale.notes || scale.notes.length < 7) {
      console.error('Invalid scale for secondary dominants');
      return [];
    }

    const secondaryDominants = [];
    const romanNumerals = ['V/ii', 'V/iii', 'V/iv', 'V/v', 'V/vi', 'V/vii'];

    // For each scale degree except the tonic, create its dominant 7th chord
    scale.notes.forEach((targetNote, index) => {
      if (index === 0) return; // Skip tonic (I)

      // The dominant is 7 semitones above the target
      const dominantRoot = transposeNote(targetNote, 7);

      // Build dominant 7th chord: root, major 3rd (4 semitones), perfect 5th (7 semitones), minor 7th (10 semitones)
      const notes = [
        dominantRoot,
        transposeNote(dominantRoot, 4),  // major 3rd
        transposeNote(dominantRoot, 7),  // perfect 5th
        transposeNote(dominantRoot, 10)  // minor 7th
      ];

      secondaryDominants.push({
        root: dominantRoot,
        notes: notes,
        quality: 'dominant7',
        symbol: this.getChordSymbol(dominantRoot, 'dominant7'),
        degree: romanNumerals[index - 1],
        scaleDegree: index + 1,
        type: 'secondary-dominant',
        resolvesTo: targetNote
      });
    });

    return secondaryDominants;
  }

  /**
   * Generate modal interchange chords (borrowed from parallel minor)
   * Common borrowed chords: bIII, iv, bVI, bVII, ii°
   */
  getModalInterchangeChords(scale) {
    if (!scale || !scale.root) {
      console.error('Invalid scale for modal interchange');
      return [];
    }

    const root = scale.root;
    const modalChords = [];

    // bIII - Major chord built on minor 3rd (Eb in C major)
    const bIII_root = transposeNote(root, 3);
    modalChords.push({
      root: bIII_root,
      notes: [
        bIII_root,
        transposeNote(bIII_root, 4),  // major 3rd
        transposeNote(bIII_root, 7)   // perfect 5th
      ],
      quality: 'major',
      symbol: this.getChordSymbol(bIII_root, 'major') + ' (maj7)',
      degree: 'bIII',
      scaleDegree: 3,
      type: 'modal-interchange',
      chordExtension: 'maj7'
    });

    // bVI - Major chord built on minor 6th (Ab in C major)
    const bVI_root = transposeNote(root, 8);
    modalChords.push({
      root: bVI_root,
      notes: [
        bVI_root,
        transposeNote(bVI_root, 4),   // major 3rd
        transposeNote(bVI_root, 7)    // perfect 5th
      ],
      quality: 'major',
      symbol: this.getChordSymbol(bVI_root, 'major') + ' (maj7)',
      degree: 'bVI',
      scaleDegree: 6,
      type: 'modal-interchange',
      chordExtension: 'maj7'
    });

    // iv - Minor chord built on perfect 4th (Fm in C major)
    const iv_root = transposeNote(root, 5);
    modalChords.push({
      root: iv_root,
      notes: [
        iv_root,
        transposeNote(iv_root, 3),    // minor 3rd
        transposeNote(iv_root, 7)     // perfect 5th
      ],
      quality: 'minor',
      symbol: this.getChordSymbol(iv_root, 'minor') + ' (7)',
      degree: 'iv',
      scaleDegree: 4,
      type: 'modal-interchange',
      chordExtension: '7'
    });

    // bVII - Major chord built on minor 7th (Bb in C major)
    const bVII_root = transposeNote(root, 10);
    modalChords.push({
      root: bVII_root,
      notes: [
        bVII_root,
        transposeNote(bVII_root, 4),  // major 3rd
        transposeNote(bVII_root, 7)   // perfect 5th
      ],
      quality: 'major',
      symbol: this.getChordSymbol(bVII_root, 'major') + ' (7)',
      degree: 'bVII',
      scaleDegree: 7,
      type: 'modal-interchange',
      chordExtension: '7'
    });

    // ii° - Diminished chord built on 2nd degree (Ddim in C major)
    const iiDim_root = transposeNote(root, 2);
    modalChords.push({
      root: iiDim_root,
      notes: [
        iiDim_root,
        transposeNote(iiDim_root, 3),  // minor 3rd
        transposeNote(iiDim_root, 6)   // diminished 5th
      ],
      quality: 'diminished',
      symbol: this.getChordSymbol(iiDim_root, 'diminished') + ' (m7♭5)',
      degree: 'ii°',
      scaleDegree: 2,
      type: 'modal-interchange',
      chordExtension: 'm7♭5'
    });

    return modalChords;
  }

  /**
   * Get all three layers of chords for progression building
   * Returns: { mainChords, secondaryDominants, modalInterchange }
   */
  getProgressionLayers(scale) {
    return {
      mainChords: this.harmonizeTriads(scale),
      secondaryDominants: this.getSecondaryDominants(scale),
      modalInterchange: this.getModalInterchangeChords(scale)
    };
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
