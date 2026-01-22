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
   * Generate Neapolitan chords (bII major chord)
   * Commonly used chord from Phrygian mode, creates dramatic tension
   */
  getNeapolitanChords(scale) {
    if (!scale || !scale.root) {
      console.error('Invalid scale for Neapolitan chords');
      return [];
    }

    const root = scale.root;
    const neapolitanChords = [];

    // bII - Major chord built on flat 2nd (Db in C major/minor)
    const bII_root = transposeNote(root, 1); // One semitone up

    neapolitanChords.push({
      root: bII_root,
      notes: [
        bII_root,
        transposeNote(bII_root, 4),  // major 3rd
        transposeNote(bII_root, 7)   // perfect 5th
      ],
      quality: 'major',
      symbol: this.getChordSymbol(bII_root, 'major') + ' (Maj7)',
      degree: 'bII',
      scaleDegree: 2,
      type: 'neapolitan',
      chordExtension: 'Maj7',
      function: 'Pre-dominant, resolves to V or I'
    });

    return neapolitanChords;
  }

  /**
   * Generate secondary diminished chords (vii°/X)
   * Diminished 7th chords that lead into diatonic chords
   */
  getSecondaryDiminished(scale) {
    if (!scale || !scale.notes || scale.notes.length < 7) {
      console.error('Invalid scale for secondary diminished');
      return [];
    }

    const secondaryDiminished = [];
    const romanNumerals = ['vii°/ii', 'vii°/iii', 'vii°/iv', 'vii°/v', 'vii°/vi', 'vii°/vii'];

    // For each scale degree, create its leading-tone diminished 7th chord
    scale.notes.forEach((targetNote, index) => {
      if (index === 0) return; // Skip tonic

      // The diminished 7th is built on the note a half-step below the target
      const dimRoot = transposeNote(targetNote, 11); // 11 semitones = -1 semitone

      // Build diminished 7th chord: root, minor 3rd, diminished 5th, diminished 7th
      const notes = [
        dimRoot,
        transposeNote(dimRoot, 3),  // minor 3rd
        transposeNote(dimRoot, 6),  // diminished 5th (tritone)
        transposeNote(dimRoot, 9)   // diminished 7th
      ];

      secondaryDiminished.push({
        root: dimRoot,
        notes: notes,
        quality: 'diminished7',
        symbol: this.getChordSymbol(dimRoot, 'diminished') + '7',
        degree: romanNumerals[index - 1],
        scaleDegree: index + 1,
        type: 'secondary-diminished',
        resolvesTo: targetNote,
        function: 'Leading tone chord'
      });
    });

    return secondaryDiminished;
  }

  /**
   * Get all three layers of chords for progression building
   * Returns: { mainChords, secondaryDominants, modalInterchange }
   */
  getProgressionLayers(scale) {
    return {
      mainChords: this.harmonizeTriads(scale),
      secondaryDominants: this.getSecondaryDominants(scale),
      modalInterchange: this.getModalInterchangeChords(scale),
      neapolitan: this.getNeapolitanChords(scale),
      secondaryDiminished: this.getSecondaryDiminished(scale)
    };
  }

  /**
   * Style-specific progression templates
   * Each template uses scale degree indices (0-6 for I-VII)
   * Special markers: 'V/X' for secondary dominants, 'bX' for modal interchange
   */
  getStyleTemplates() {
    return {
      pop: {
        name: 'Pop/Rock',
        templates: [
          // Classic hit progressions
          { name: 'Axis of Awesome', degrees: [0, 4, 5, 3], description: 'I-V-vi-IV (most popular)' },
          { name: 'Sensitive Female', degrees: [5, 3, 0, 4], description: 'vi-IV-I-V' },
          { name: '50s Doo-Wop', degrees: [0, 5, 3, 4], description: 'I-vi-IV-V' },
          { name: 'Pachelbel Canon', degrees: [0, 4, 5, 2, 3, 0, 3, 4], description: 'I-V-vi-iii-IV-I-IV-V' },
          { name: 'Pop Punk', degrees: [0, 3, 5, 4], description: 'I-IV-vi-V' },
          { name: 'Andalusian', degrees: [5, 4, 3, 2], description: 'vi-V-IV-iii (descending)' },
          { name: 'Sting/Police', degrees: [0, 'bVII', 3, 0], description: 'I-bVII-IV-I' },
          { name: 'Hey Joe', degrees: [0, 3, 0, 4, 0, 'bVII', 0, 0], description: 'I-IV-I-V-I-bVII-I' },
          { name: 'Sweet Home', degrees: [0, 0, 3, 3, 4, 4, 0, 0], description: 'I-IV-V-I' },
          { name: 'Green Day', degrees: [0, 4, 1, 3], description: 'I-V-ii-IV' },
          { name: 'Blink-182', degrees: [0, 3, 5, 4], description: 'I-IV-vi-V' },
          { name: 'Taylor Swift', degrees: [0, 4, 2, 3], description: 'I-V-ii-IV' },
        ],
        chromaticChance: 0.15,
        preferredCadence: 'authentic' // V-I
      },

      jazz: {
        name: 'Jazz',
        templates: [
          // Standard jazz progressions
          { name: 'ii-V-I', degrees: [1, 4, 0], description: 'The fundamental jazz cadence' },
          { name: 'ii-V-I-VI', degrees: [1, 4, 0, 5], description: 'Turnaround' },
          { name: 'I-VI-ii-V', degrees: [0, 5, 1, 4], description: 'Rhythm changes A section' },
          { name: 'iii-VI-ii-V', degrees: [2, 5, 1, 4], description: 'Extended turnaround' },
          { name: 'Coltrane Changes', degrees: [0, 'V/bVI', 'bVI', 'V/bIII', 'bIII', 'V/I'], description: 'Giant Steps pattern' },
          { name: 'Bird Blues', degrees: [0, 'V/IV', 3, 'iv', 0, 'V/ii', 1, 4, 0, 'V/ii', 1, 4], description: '12-bar bebop blues' },
          { name: 'Modal Jazz', degrees: [1, 4, 1, 4, 1, 4, 0, 0], description: 'So What / Impressions' },
          { name: 'Autumn Leaves', degrees: [1, 4, 0, 3, 6, 'V/ii', 1, 1], description: 'Minor key standard' },
          { name: 'Backdoor ii-V', degrees: [0, 'iv', 'bVII', 0], description: 'iv-bVII-I resolution' },
          { name: 'Tritone Sub', degrees: [1, 'bII', 0], description: 'ii-bII-I (tritone substitution)' },
          { name: 'Lady Bird', degrees: [0, 'V/IV', 3, 'V/bVI', 'bVI', 'V/bIII', 'bIII', 0], description: 'Tadd Dameron turnaround' },
          { name: 'Confirmation', degrees: [0, 'V/ii', 1, 4, 0, 2, 'V/ii', 1], description: 'Charlie Parker changes' },
        ],
        chromaticChance: 0.4,
        preferredCadence: 'ii-V-I'
      },

      classical: {
        name: 'Classical',
        templates: [
          // Common practice period progressions
          { name: 'Authentic Cadence', degrees: [0, 3, 4, 0], description: 'I-IV-V-I' },
          { name: 'Plagal Cadence', degrees: [0, 4, 0, 3, 0], description: 'I-V-I-IV-I' },
          { name: 'Circle of Fifths', degrees: [0, 3, 6, 2, 5, 1, 4, 0], description: 'I-IV-vii°-iii-vi-ii-V-I' },
          { name: 'Romanesca', degrees: [0, 4, 5, 2, 3, 0, 3, 4], description: 'Renaissance bass pattern' },
          { name: 'Passamezzo', degrees: [0, 6, 0, 4, 0, 6, 4, 0], description: 'i-VII-i-V-i-VII-V-i' },
          { name: 'Baroque Sequence', degrees: [0, 3, 6, 2, 5, 1, 4, 0], description: 'Descending fifths' },
          { name: 'Mozart Cadence', degrees: [3, 'vii°/V', 4, 0], description: 'IV-vii°/V-V-I with applied chord' },
          { name: 'Deceptive Cadence', degrees: [0, 3, 4, 5], description: 'I-IV-V-vi (surprise ending)' },
          { name: 'Neapolitan', degrees: [0, 3, 'bII', 4, 0], description: 'I-IV-bII-V-I' },
          { name: 'Augmented 6th', degrees: [0, 3, 'bVI', 4, 0], description: 'With Italian/German 6th' },
          { name: 'Omnibus', degrees: [0, 'V/IV', 3, 'iv', 4, 0], description: 'Chromatic omnibus progression' },
        ],
        chromaticChance: 0.25,
        preferredCadence: 'authentic'
      },

      blues: {
        name: 'Blues',
        templates: [
          // Blues progressions
          { name: '12-Bar Blues', degrees: [0, 0, 0, 0, 3, 3, 0, 0, 4, 3, 0, 4], description: 'Standard 12-bar' },
          { name: 'Quick Change', degrees: [0, 3, 0, 0, 3, 3, 0, 0, 4, 3, 0, 4], description: '12-bar with quick IV' },
          { name: '8-Bar Blues', degrees: [0, 0, 3, 3, 0, 4, 0, 4], description: 'Shorter form' },
          { name: 'Minor Blues', degrees: [0, 0, 0, 0, 3, 3, 0, 0, 'bVI', 4, 0, 4], description: '12-bar minor' },
          { name: 'Jazz Blues', degrees: [0, 'V/IV', 3, 'iv', 0, 'V/ii', 1, 4, 0, 1, 4, 0], description: 'With ii-V turnarounds' },
          { name: 'Stormy Monday', degrees: [0, 'V/IV', 3, 'iv', 0, 1, 4, 3, 0, 0], description: 'T-Bone Walker changes' },
          { name: 'Bird Blues', degrees: [0, 'V/IV', 3, 'iv', 0, 5, 1, 4, 2, 4, 0, 4], description: 'Bebop blues' },
          { name: 'Slow Blues', degrees: [0, 0, 0, 0, 3, 3, 0, 0, 4, 4, 0, 0], description: 'Extended I chord' },
        ],
        chromaticChance: 0.2,
        preferredCadence: 'blues' // V-IV-I
      },

      rnb: {
        name: 'R&B/Soul',
        templates: [
          { name: 'Neo-Soul', degrees: [1, 4, 0, 5], description: 'ii-V-I-vi' },
          { name: 'Motown', degrees: [0, 0, 3, 4], description: 'I-I-IV-V' },
          { name: 'Gospel Turn', degrees: [0, 0, 'V/IV', 3], description: 'I-I-V/IV-IV' },
          { name: 'Quiet Storm', degrees: [1, 1, 4, 0], description: 'ii-ii-V-I' },
          { name: 'Erykah Badu', degrees: [1, 'bIII', 4, 0], description: 'ii-bIII-V-I' },
          { name: 'D\'Angelo', degrees: [0, 2, 3, 4], description: 'I-iii-IV-V' },
          { name: 'Stevie Wonder', degrees: [0, 'V/ii', 1, 4, 0, 'bVII'], description: 'With secondary dominants' },
          { name: 'Gospel Shout', degrees: [3, 0, 3, 0, 4, 0], description: 'IV-I-IV-I-V-I' },
        ],
        chromaticChance: 0.3,
        preferredCadence: 'plagal' // IV-I
      },

      edm: {
        name: 'EDM/Electronic',
        templates: [
          { name: 'Trance', degrees: [5, 3, 0, 4], description: 'vi-IV-I-V' },
          { name: 'House', degrees: [0, 4, 5, 3], description: 'I-V-vi-IV' },
          { name: 'Future Bass', degrees: [0, 5, 3, 4], description: 'I-vi-IV-V' },
          { name: 'Euphoric', degrees: [5, 4, 0, 'bVII'], description: 'vi-V-I-bVII' },
          { name: 'Dark Techno', degrees: [0, 'bVII', 'bVI', 4], description: 'i-bVII-bVI-V (phrygian)' },
          { name: 'Progressive', degrees: [0, 3, 5, 5], description: 'I-IV-vi-vi' },
          { name: 'Melodic Dubstep', degrees: [5, 0, 3, 4], description: 'vi-I-IV-V' },
          { name: 'Tropical', degrees: [0, 5, 3, 3], description: 'I-vi-IV-IV' },
        ],
        chromaticChance: 0.1,
        preferredCadence: 'loop' // Continuous loop
      },

      folk: {
        name: 'Folk/Country',
        templates: [
          { name: 'Three Chord', degrees: [0, 3, 4, 0], description: 'I-IV-V-I' },
          { name: 'Nashville', degrees: [0, 4, 3, 0], description: 'I-V-IV-I' },
          { name: 'Wagon Wheel', degrees: [0, 4, 5, 3], description: 'I-V-vi-IV' },
          { name: 'Wildwood Flower', degrees: [0, 0, 3, 0, 0, 4, 0, 0], description: 'Traditional picking' },
          { name: 'Irish Washerwoman', degrees: [0, 4, 0, 3, 0, 4, 0, 0], description: 'Celtic pattern' },
          { name: 'Bluegrass', degrees: [0, 3, 0, 4, 0, 3, 4, 0], description: 'I-IV-I-V-I-IV-V-I' },
          { name: 'Murder Ballad', degrees: [0, 5, 3, 4], description: 'I-vi-IV-V' },
          { name: 'Mountain Modal', degrees: [0, 'bVII', 0, 3], description: 'Mixolydian flavor' },
        ],
        chromaticChance: 0.05,
        preferredCadence: 'authentic'
      },

      metal: {
        name: 'Metal/Hard Rock',
        templates: [
          { name: 'Power Chord', degrees: [0, 'bVII', 'bVI', 4], description: 'i-bVII-bVI-V' },
          { name: 'Djent', degrees: [0, 'bVII', 0, 'bVI'], description: 'Syncopated riff pattern' },
          { name: 'Thrash', degrees: [0, 'bII', 0, 4], description: 'i-bII-i-V' },
          { name: 'Doom', degrees: [0, 3, 0, 'bVI'], description: 'Slow and heavy' },
          { name: 'Gallop', degrees: [0, 0, 'bVII', 'bVII', 'bVI', 'bVI', 4, 4], description: 'Iron Maiden style' },
          { name: 'Prog Metal', degrees: [0, 2, 5, 'bVII', 3, 4], description: 'Complex movement' },
          { name: 'Nu Metal', degrees: [0, 0, 'bVII', 3], description: 'Drop tuning riff' },
          { name: 'Harmonic Minor', degrees: [0, 3, 4, 0], description: 'Neoclassical' },
        ],
        chromaticChance: 0.35,
        preferredCadence: 'phrygian' // bII-i
      },

      experimental: {
        name: 'Experimental/Avant-garde',
        templates: [
          { name: 'Chromatic Planing', degrees: [0, 'bII', 1, 'bIII', 2, 'bVI'], description: 'Parallel movement' },
          { name: 'Whole Tone', degrees: [0, 'bIII', 'bVI', 0], description: 'Augmented harmony' },
          { name: 'Quartal', degrees: [0, 3, 'bVII', 2, 5], description: 'Fourth-based voicings' },
          { name: 'Atonal Island', degrees: [0, 'bVI', 2, 'bII', 4, 'bVII'], description: 'No clear tonal center' },
          { name: 'Messiaen Mode', degrees: [0, 'bII', 2, 3, 'bVI', 5], description: 'Symmetrical patterns' },
          { name: 'Coltrane Matrix', degrees: [0, 'bVI', 'bIII', 0], description: 'Major thirds cycle' },
          { name: 'Negative Harmony', degrees: [0, 3, 'iv', 0], description: 'Mirrored functions' },
          { name: 'Random Walk', degrees: [], description: 'Algorithmically generated' },
        ],
        chromaticChance: 0.6,
        preferredCadence: 'none'
      }
    };
  }

  /**
   * Functional harmony rules - what can follow what
   * T = Tonic (I, vi, iii), PD = Pre-dominant (ii, IV), D = Dominant (V, vii°)
   */
  getFunctionalHarmonyRules() {
    return {
      // Tonic function chords
      I: { canFollow: ['V', 'vii', 'IV', 'ii', 'vi', 'bVII', 'bVI', 'bII'], function: 'tonic' },
      vi: { canFollow: ['I', 'V', 'IV', 'iii', 'bVII'], function: 'tonic' },
      iii: { canFollow: ['I', 'vi', 'IV', 'V'], function: 'tonic' },

      // Pre-dominant function chords
      IV: { canFollow: ['I', 'vi', 'ii', 'iii', 'bVII'], function: 'predominant' },
      ii: { canFollow: ['I', 'vi', 'IV', 'iii'], function: 'predominant' },

      // Dominant function chords
      V: { canFollow: ['IV', 'ii', 'I', 'vi', 'bII', 'bVI'], function: 'dominant' },
      vii: { canFollow: ['IV', 'ii', 'vi'], function: 'dominant' },

      // Modal interchange chords
      bVII: { canFollow: ['I', 'IV', 'vi', 'bVI'], function: 'subdominant' },
      bVI: { canFollow: ['I', 'V', 'bVII', 'iv'], function: 'subdominant' },
      bIII: { canFollow: ['I', 'bVI', 'bVII'], function: 'tonic' },
      iv: { canFollow: ['I', 'V', 'bVI', 'bVII'], function: 'predominant' },

      // Neapolitan
      bII: { canFollow: ['IV', 'ii', 'I', 'vi'], function: 'predominant' }
    };
  }

  /**
   * Generate an intelligent chord progression following voice leading rules
   * @param {Object} scale - The scale to use
   * @param {Number} length - Number of chords in progression (4, 8, 16)
   * @param {String} complexity - 'simple', 'moderate', 'complex'
   * @param {String} style - 'pop', 'jazz', 'classical', 'blues', 'rnb', 'edm', 'folk', 'metal', 'experimental'
   * @returns {Array} - Array of chord objects with layer information
   */
  generateProgression(scale, length = 8, complexity = 'moderate', style = 'pop') {
    const layers = this.getProgressionLayers(scale);
    const templates = this.getStyleTemplates();
    const styleConfig = templates[style] || templates.pop;

    // Decide whether to use a template or generate algorithmically
    const useTemplate = Math.random() < 0.7 && styleConfig.templates.length > 0;

    if (useTemplate) {
      return this.generateFromTemplate(scale, length, complexity, style, layers, styleConfig);
    } else {
      return this.generateAlgorithmic(scale, length, complexity, style, layers, styleConfig);
    }
  }

  /**
   * Generate progression from a style-specific template
   */
  generateFromTemplate(scale, length, complexity, style, layers, styleConfig) {
    // Filter templates that can fit the desired length
    const validTemplates = styleConfig.templates.filter(t =>
      t.degrees.length > 0 && t.degrees.length <= length
    );

    if (validTemplates.length === 0) {
      return this.generateAlgorithmic(scale, length, complexity, style, layers, styleConfig);
    }

    // Pick a random template
    const template = validTemplates[Math.floor(Math.random() * validTemplates.length)];
    const progression = [];

    // Convert template degrees to actual chords
    const baseProgression = this.templateToChords(template.degrees, layers, scale);

    // Extend or repeat to fill desired length
    while (progression.length < length) {
      for (const chord of baseProgression) {
        if (progression.length >= length) break;

        // Apply chromatic variations based on complexity
        const finalChord = this.applyComplexityVariation(chord, layers, complexity, styleConfig);
        progression.push(finalChord);
      }
    }

    // Ensure proper chromatic resolution
    return this.ensureChromaticResolution(progression, layers);
  }

  /**
   * Convert template degree notation to actual chord objects
   */
  templateToChords(degrees, layers, scale) {
    const chords = [];

    for (const degree of degrees) {
      let chord = null;
      let layer = 'main';

      if (typeof degree === 'number') {
        // Diatonic chord (0-6 = I-VII)
        chord = layers.mainChords[degree];
        layer = 'main';
      } else if (typeof degree === 'string') {
        // Special chord notation
        chord = this.resolveSpecialChord(degree, layers, scale);
        layer = chord?.layer || 'main';
      }

      if (chord) {
        chords.push({ ...chord, layer });
      }
    }

    return chords;
  }

  /**
   * Resolve special chord notations like 'V/ii', 'bVII', 'iv'
   */
  resolveSpecialChord(notation, layers, scale) {
    // Secondary dominants: V/ii, V/iii, V/IV, V/V, V/vi
    if (notation.startsWith('V/')) {
      const target = notation.substring(2);
      const targetIndex = this.degreeToIndex(target);
      if (targetIndex !== null && layers.secondaryDominants[targetIndex - 1]) {
        return { ...layers.secondaryDominants[targetIndex - 1], layer: 'secondary' };
      }
    }

    // Secondary diminished: vii°/ii, vii°/iii, etc.
    if (notation.startsWith('vii°/')) {
      const target = notation.substring(5);
      const targetIndex = this.degreeToIndex(target);
      if (targetIndex !== null && layers.secondaryDiminished[targetIndex - 1]) {
        return { ...layers.secondaryDiminished[targetIndex - 1], layer: 'secondary-dim' };
      }
    }

    // Modal interchange chords
    const modalMap = {
      'bIII': 0, // First modal interchange chord
      'bVI': 1,
      'iv': 2,
      'bVII': 3,
      'ii°': 4
    };

    if (notation in modalMap && layers.modalInterchange[modalMap[notation]]) {
      return { ...layers.modalInterchange[modalMap[notation]], layer: 'modal' };
    }

    // Neapolitan
    if (notation === 'bII' && layers.neapolitan[0]) {
      return { ...layers.neapolitan[0], layer: 'neapolitan' };
    }

    // Fallback to tonic
    return { ...layers.mainChords[0], layer: 'main' };
  }

  /**
   * Convert degree notation to index (I=0, ii=1, etc.)
   */
  degreeToIndex(degree) {
    const map = {
      'I': 0, 'i': 0,
      'II': 1, 'ii': 1,
      'III': 2, 'iii': 2,
      'IV': 3, 'iv': 3,
      'V': 4, 'v': 4,
      'VI': 5, 'vi': 5,
      'VII': 6, 'vii': 6
    };
    return map[degree] ?? null;
  }

  /**
   * Apply complexity-based variations to chords
   */
  applyComplexityVariation(chord, layers, complexity, styleConfig) {
    const chromaticChance = {
      simple: styleConfig.chromaticChance * 0.3,
      moderate: styleConfig.chromaticChance,
      complex: styleConfig.chromaticChance * 1.5
    }[complexity] || styleConfig.chromaticChance;

    // Maybe add a secondary dominant before this chord
    if (Math.random() < chromaticChance && chord.scaleDegree > 1) {
      // Find secondary dominant that resolves to this chord
      const secDom = layers.secondaryDominants.find(sd =>
        sd.resolvesTo === chord.root
      );
      if (secDom) {
        // Return the secondary dominant - the original chord will be added next iteration
        return { ...secDom, layer: 'secondary', resolvesToNext: chord };
      }
    }

    return chord;
  }

  /**
   * Ensure chromatic chords resolve properly
   */
  ensureChromaticResolution(progression, layers) {
    const resolved = [];

    for (let i = 0; i < progression.length; i++) {
      const chord = progression[i];
      const nextChord = progression[i + 1];

      resolved.push(chord);

      // If this is a secondary dominant, ensure it resolves correctly
      if (chord.type === 'secondary-dominant' && chord.resolvesTo) {
        // Check if next chord is the resolution target
        if (!nextChord || nextChord.root !== chord.resolvesTo) {
          // Insert resolution chord
          const resolutionChord = layers.mainChords.find(c => c.root === chord.resolvesTo);
          if (resolutionChord && resolved.length < progression.length) {
            // Only insert if we have room and next chord isn't already the target
            if (!nextChord || nextChord.root !== chord.resolvesTo) {
              // Mark that we want resolution (handled by progression display)
              chord.expectsResolution = chord.resolvesTo;
            }
          }
        }
      }

      // Secondary diminished should resolve up by half step
      if (chord.type === 'secondary-diminished' && chord.resolvesTo) {
        if (!nextChord || nextChord.root !== chord.resolvesTo) {
          chord.expectsResolution = chord.resolvesTo;
        }
      }

      // Neapolitan typically resolves to V or I
      if (chord.type === 'neapolitan') {
        if (nextChord && nextChord.scaleDegree !== 5 && nextChord.scaleDegree !== 1) {
          chord.expectsResolution = 'V or I';
        }
      }
    }

    return resolved;
  }

  /**
   * Generate progression algorithmically using functional harmony
   */
  generateAlgorithmic(scale, length, complexity, style, layers, styleConfig) {
    const progression = [];
    const rules = this.getFunctionalHarmonyRules();

    // Complexity affects chromatic chord probability
    const chromaticWeights = {
      simple: { main: 0.9, secondary: 0.07, modal: 0.03, neapolitan: 0, secondaryDim: 0 },
      moderate: { main: 0.65, secondary: 0.18, modal: 0.12, neapolitan: 0.03, secondaryDim: 0.02 },
      complex: { main: 0.4, secondary: 0.25, modal: 0.2, neapolitan: 0.08, secondaryDim: 0.07 }
    };
    const weights = chromaticWeights[complexity] || chromaticWeights.moderate;

    // Start with tonic
    progression.push({ ...layers.mainChords[0], layer: 'main' });

    // Build phrase by phrase (4-bar phrases)
    const phraseLength = 4;
    const numPhrases = Math.ceil(length / phraseLength);

    for (let phrase = 0; phrase < numPhrases; phrase++) {
      const isLastPhrase = phrase === numPhrases - 1;
      const phraseStart = phrase * phraseLength;
      const phraseEnd = Math.min(phraseStart + phraseLength, length);

      for (let i = progression.length; i < phraseEnd; i++) {
        const posInPhrase = i - phraseStart;
        const isLastInPhrase = posInPhrase === phraseLength - 1;
        const isLastChord = i === length - 1;
        const isPenultimate = i === length - 2;

        const lastChord = progression[progression.length - 1];
        let nextChord;

        // Handle cadences
        if (isLastChord) {
          nextChord = this.selectCadentialChord(lastChord, layers, styleConfig, 'final');
        } else if (isPenultimate) {
          nextChord = this.selectCadentialChord(lastChord, layers, styleConfig, 'penultimate');
        } else if (isLastInPhrase && !isLastPhrase) {
          // Half cadence at phrase boundary
          nextChord = this.selectCadentialChord(lastChord, layers, styleConfig, 'half');
        } else {
          // Regular chord selection
          nextChord = this.selectNextChordFunctional(lastChord, layers, weights, rules, style);
        }

        // Ensure chromatic chords resolve
        if (lastChord.type === 'secondary-dominant' || lastChord.type === 'secondary-diminished') {
          // Force resolution
          const resolution = layers.mainChords.find(c => c.root === lastChord.resolvesTo);
          if (resolution) {
            nextChord = { ...resolution, layer: 'main' };
          }
        }

        progression.push(nextChord);
      }
    }

    return this.ensureChromaticResolution(progression.slice(0, length), layers);
  }

  /**
   * Select cadential chord based on position and style
   */
  selectCadentialChord(lastChord, layers, styleConfig, cadenceType) {
    const { preferredCadence } = styleConfig;

    switch (cadenceType) {
      case 'final':
        // Final chord - almost always tonic
        if (Math.random() < 0.9) {
          return { ...layers.mainChords[0], layer: 'main' }; // I
        }
        // Occasionally end on vi for "unresolved" feeling
        return { ...layers.mainChords[5], layer: 'main' }; // vi

      case 'penultimate':
        // Choose based on style's preferred cadence
        if (preferredCadence === 'plagal' || preferredCadence === 'blues') {
          return { ...layers.mainChords[3], layer: 'main' }; // IV
        } else if (preferredCadence === 'ii-V-I') {
          // Check if we can do ii-V
          if (lastChord.scaleDegree === 2) {
            return { ...layers.mainChords[4], layer: 'main' }; // V
          }
          return { ...layers.mainChords[1], layer: 'main' }; // ii
        } else if (preferredCadence === 'phrygian') {
          return { ...layers.neapolitan[0], layer: 'neapolitan' }; // bII
        }
        // Default: authentic cadence (V)
        return { ...layers.mainChords[4], layer: 'main' }; // V

      case 'half':
        // Half cadence - end phrase on V
        if (Math.random() < 0.7) {
          return { ...layers.mainChords[4], layer: 'main' }; // V
        }
        // Or deceptive to vi
        return { ...layers.mainChords[5], layer: 'main' }; // vi

      default:
        return { ...layers.mainChords[0], layer: 'main' };
    }
  }

  /**
   * Select next chord using functional harmony rules
   */
  selectNextChordFunctional(currentChord, layers, weights, rules, style) {
    // First, decide which layer to use
    const rand = Math.random();
    let layer = 'main';
    let cumulative = 0;

    for (const [layerName, weight] of Object.entries(weights)) {
      cumulative += weight;
      if (rand < cumulative) {
        layer = layerName;
        break;
      }
    }

    // Get available chords from layer
    let availableChords;
    let layerKey;

    switch (layer) {
      case 'secondary':
        availableChords = layers.secondaryDominants;
        layerKey = 'secondary';
        break;
      case 'modal':
        availableChords = layers.modalInterchange;
        layerKey = 'modal';
        break;
      case 'neapolitan':
        availableChords = layers.neapolitan;
        layerKey = 'neapolitan';
        break;
      case 'secondaryDim':
        availableChords = layers.secondaryDiminished;
        layerKey = 'secondary-dim';
        break;
      default:
        availableChords = layers.mainChords;
        layerKey = 'main';
    }

    // Filter by functional harmony rules
    const currentDegree = currentChord.degree?.toUpperCase().replace(/[^IVXB]/g, '') || 'I';
    const rule = rules[currentDegree];

    let validChords = availableChords.filter(chord => {
      // Don't repeat same chord
      if (chord.root === currentChord.root && chord.quality === currentChord.quality) {
        return false;
      }

      // Check functional harmony (for main chords)
      if (layerKey === 'main' && rule) {
        const chordDegree = chord.degree?.toUpperCase().replace(/[^IVXB]/g, '');
        if (!rule.canFollow.some(d => chordDegree?.includes(d))) {
          return Math.random() < 0.2; // Small chance to break rules
        }
      }

      return true;
    });

    // If no valid chords, fall back to any main chord
    if (validChords.length === 0) {
      validChords = layers.mainChords.filter(c =>
        c.root !== currentChord.root || c.quality !== currentChord.quality
      );
    }

    // Score by voice leading and select
    const scored = validChords.map(chord => ({
      chord,
      score: this.scoreChordTransition(currentChord, chord, style)
    }));

    scored.sort((a, b) => b.score - a.score);

    // Weighted random from top choices
    const topN = Math.min(3, scored.length);
    const selected = scored[Math.floor(Math.random() * topN)];

    return { ...selected.chord, layer: layerKey };
  }

  /**
   * Score a chord transition for voice leading quality
   */
  scoreChordTransition(from, to, style) {
    let score = 0;

    // Common tones (good voice leading)
    const commonTones = this.countCommonTones(from.notes, to.notes);
    score += commonTones * 10;

    // Bass motion
    const bassInterval = Math.abs(getNoteIndex(from.root) - getNoteIndex(to.root));

    // Prefer stepwise or fifth motion in bass
    if (bassInterval === 5 || bassInterval === 7) score += 15; // Perfect 4th/5th
    if (bassInterval === 2 || bassInterval === 1) score += 10; // Step
    if (bassInterval === 0) score -= 20; // Same bass = less interesting

    // Style-specific preferences
    const styleScores = {
      pop: { 'IV': 5, 'V': 5, 'vi': 8 },
      jazz: { 'ii': 10, 'V': 8, 'vi': 5 },
      classical: { 'V': 10, 'IV': 5, 'ii': 8 },
      blues: { 'IV': 10, 'V': 8 },
      folk: { 'IV': 8, 'V': 8, 'I': 5 }
    };

    const prefs = styleScores[style] || {};
    const toDegree = to.degree?.toUpperCase().replace(/[^IVX]/g, '');
    if (prefs[toDegree]) {
      score += prefs[toDegree];
    }

    return score;
  }

  /**
   * Count common tones between two chords
   */
  countCommonTones(notes1, notes2) {
    if (!notes1 || !notes2) return 0;
    let count = 0;
    for (const note1 of notes1) {
      if (notes2.includes(note1)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Analyze a chord progression and provide insights
   */
  analyzeProgression(progression, scale) {
    const analysis = {
      length: progression.length,
      chords: [],
      features: [],
      keyCenter: scale.root,
      complexity: 'moderate'
    };

    // Analyze each chord
    progression.forEach((chord, index) => {
      const chordAnalysis = {
        position: index + 1,
        symbol: chord.symbol,
        degree: chord.degree,
        layer: chord.layer,
        function: this.getChordFunction(chord, scale)
      };

      // Analyze transitions
      if (index > 0) {
        const prevChord = progression[index - 1];
        chordAnalysis.transition = this.analyzeTransition(prevChord, chord);
      }

      analysis.chords.push(chordAnalysis);
    });

    // Identify key features
    const layerCounts = {
      main: 0,
      secondary: 0,
      modal: 0,
      neapolitan: 0,
      'secondary-dim': 0
    };

    progression.forEach(chord => {
      if (chord.layer in layerCounts) {
        layerCounts[chord.layer]++;
      }
    });

    // Determine complexity
    const nonDiatonicChords = progression.length - layerCounts.main;
    if (nonDiatonicChords === 0) {
      analysis.complexity = 'simple';
    } else if (nonDiatonicChords <= 2) {
      analysis.complexity = 'moderate';
    } else {
      analysis.complexity = 'complex';
    }

    // Add features
    if (layerCounts.secondary > 0) {
      analysis.features.push('Contains secondary dominants');
    }
    if (layerCounts.modal > 0) {
      analysis.features.push('Uses modal interchange');
    }
    if (layerCounts.neapolitan > 0) {
      analysis.features.push('Includes Neapolitan harmony');
    }
    if (layerCounts['secondary-dim'] > 0) {
      analysis.features.push('Uses secondary diminished chords');
    }

    // Check for common cadences
    if (progression.length >= 2) {
      const lastTwo = progression.slice(-2);
      if (lastTwo[0].degree === 'V' && lastTwo[1].degree === 'I') {
        analysis.features.push('Perfect authentic cadence (V-I)');
      } else if (lastTwo[0].degree === 'IV' && lastTwo[1].degree === 'I') {
        analysis.features.push('Plagal cadence (IV-I)');
      }
    }

    return analysis;
  }

  /**
   * Get the harmonic function of a chord
   */
  getChordFunction(chord, scale) {
    if (!chord.degree) return 'Unknown';

    const degree = chord.degree.toUpperCase();

    if (degree.includes('I') && !degree.includes('II') && !degree.includes('III') && !degree.includes('VI')) {
      return 'Tonic';
    } else if (degree.includes('V') || degree.includes('VII')) {
      return 'Dominant';
    } else if (degree.includes('IV') || degree.includes('II')) {
      return 'Subdominant';
    } else if (degree.includes('VI') || degree.includes('III')) {
      return 'Tonic/Predominant';
    }

    return 'Chromatic';
  }

  /**
   * Analyze the transition between two chords
   */
  analyzeTransition(chord1, chord2) {
    const commonTones = this.countCommonTones(chord1.notes, chord2.notes);

    let quality = 'smooth';
    if (commonTones === 0) {
      quality = 'disjunct';
    } else if (commonTones >= 2) {
      quality = 'very smooth';
    }

    return {
      commonTones,
      quality,
      voiceLeading: quality
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
