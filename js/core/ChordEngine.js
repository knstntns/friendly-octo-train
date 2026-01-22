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
   * Generate an intelligent chord progression following voice leading rules
   * @param {Object} scale - The scale to use
   * @param {Number} length - Number of chords in progression (4, 8, 16)
   * @param {String} complexity - 'simple', 'moderate', 'complex'
   * @param {String} style - 'pop', 'jazz', 'classical', 'experimental'
   * @returns {Array} - Array of chord objects with layer information
   */
  generateProgression(scale, length = 4, complexity = 'moderate', style = 'pop') {
    const layers = this.getProgressionLayers(scale);
    const progression = [];

    // Start with tonic (I chord)
    const tonicChord = { ...layers.mainChords[0], layer: 'main' };
    progression.push(tonicChord);

    // Probability weights based on complexity
    const complexityWeights = {
      simple: {
        main: 0.85,
        secondaryDominants: 0.10,
        modalInterchange: 0.05,
        neapolitan: 0.0,
        secondaryDiminished: 0.0
      },
      moderate: {
        main: 0.60,
        secondaryDominants: 0.20,
        modalInterchange: 0.15,
        neapolitan: 0.03,
        secondaryDiminished: 0.02
      },
      complex: {
        main: 0.40,
        secondaryDominants: 0.25,
        modalInterchange: 0.20,
        neapolitan: 0.08,
        secondaryDiminished: 0.07
      }
    };

    const weights = complexityWeights[complexity] || complexityWeights.moderate;

    // Define strong cadential chords (I, IV, V)
    const strongChords = [
      layers.mainChords[0], // I
      layers.mainChords[3], // IV
      layers.mainChords[4]  // V
    ];

    // Generate progression following voice leading rules
    for (let i = 1; i < length; i++) {
      const lastChord = progression[progression.length - 1];
      const isLastPosition = (i === length - 1);
      const isPenultimate = (i === length - 2);

      let nextChord;

      // Force ending on tonic for most progressions
      if (isLastPosition && Math.random() > 0.2) {
        nextChord = { ...layers.mainChords[0], layer: 'main' };
      } else if (isPenultimate && Math.random() > 0.4) {
        // Penultimate chord - prefer V or IV for strong cadence
        const cadentialChord = Math.random() > 0.5 ? layers.mainChords[4] : layers.mainChords[3];
        nextChord = { ...cadentialChord, layer: 'main' };
      } else {
        // Select next chord based on complexity and voice leading
        nextChord = this.selectNextChord(lastChord, layers, weights, style);
      }

      progression.push(nextChord);
    }

    return progression;
  }

  /**
   * Select the next chord based on voice leading rules and style
   */
  selectNextChord(currentChord, layers, weights, style) {
    // Determine which layer to use based on weights
    const rand = Math.random();
    let cumulativeWeight = 0;
    let selectedLayer = 'main';

    for (const [layerName, weight] of Object.entries(weights)) {
      cumulativeWeight += weight;
      if (rand < cumulativeWeight) {
        selectedLayer = layerName;
        break;
      }
    }

    // Get available chords from selected layer
    let availableChords = [];
    let layerKey = 'main';

    switch(selectedLayer) {
      case 'main':
        availableChords = layers.mainChords;
        layerKey = 'main';
        break;
      case 'secondaryDominants':
        availableChords = layers.secondaryDominants;
        layerKey = 'secondary';
        break;
      case 'modalInterchange':
        availableChords = layers.modalInterchange;
        layerKey = 'modal';
        break;
      case 'neapolitan':
        availableChords = layers.neapolitan;
        layerKey = 'neapolitan';
        break;
      case 'secondaryDiminished':
        availableChords = layers.secondaryDiminished;
        layerKey = 'secondary-dim';
        break;
    }

    // Filter chords based on voice leading rules
    const validChords = this.getValidNextChords(currentChord, availableChords, style);

    if (validChords.length === 0) {
      // Fallback to main chords if no valid options
      const fallbackChord = layers.mainChords[Math.floor(Math.random() * layers.mainChords.length)];
      return { ...fallbackChord, layer: 'main' };
    }

    // Select chord based on style preferences
    const selectedChord = this.selectByStyle(validChords, currentChord, style);
    return { ...selectedChord, layer: layerKey };
  }

  /**
   * Get valid next chords based on voice leading rules
   */
  getValidNextChords(currentChord, availableChords, style) {
    if (!availableChords || availableChords.length === 0) return [];

    // Apply voice leading principles
    return availableChords.filter(chord => {
      // Avoid repeating the same chord immediately
      if (chord.root === currentChord.root && chord.quality === currentChord.quality) {
        return false;
      }

      // Check for smooth voice leading (prefer chords with common tones)
      const commonTones = this.countCommonTones(currentChord.notes, chord.notes);

      // Prefer chords with at least one common tone for smooth voice leading
      if (commonTones === 0 && Math.random() > 0.3) {
        return false;
      }

      return true;
    });
  }

  /**
   * Count common tones between two chords
   */
  countCommonTones(notes1, notes2) {
    let count = 0;
    notes1.forEach(note1 => {
      if (notes2.includes(note1)) {
        count++;
      }
    });
    return count;
  }

  /**
   * Select chord based on style preferences
   */
  selectByStyle(chords, currentChord, style) {
    if (chords.length === 0) return null;

    // Style-specific preferences
    const stylePreferences = {
      pop: ['IV', 'V', 'vi', 'I'],
      jazz: ['ii', 'V', 'I', 'vi', 'iii'],
      classical: ['V', 'IV', 'vi', 'ii'],
      experimental: [] // No preferences, use random
    };

    const preferredDegrees = stylePreferences[style] || [];

    if (preferredDegrees.length > 0) {
      // Try to find a chord matching style preferences
      for (const degree of preferredDegrees) {
        const match = chords.find(c => c.degree && c.degree.includes(degree));
        if (match && Math.random() > 0.3) {
          return match;
        }
      }
    }

    // Prefer chords with more common tones (smooth voice leading)
    const scored = chords.map(chord => ({
      chord,
      commonTones: this.countCommonTones(currentChord.notes, chord.notes)
    }));

    // Sort by common tones (descending)
    scored.sort((a, b) => b.commonTones - a.commonTones);

    // Select from top 3 with some randomness
    const topChords = scored.slice(0, Math.min(3, scored.length));
    const selected = topChords[Math.floor(Math.random() * topChords.length)];

    return selected.chord;
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
