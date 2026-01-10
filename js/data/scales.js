// Scale pattern definitions with intervals and degrees

export const SCALE_PATTERNS = {
  // Major scale and its modes
  major: {
    name: 'Major Scale (Ionian)',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    degrees: ['1', '2', '3', '4', '5', '6', '7'],
    formula: 'W-W-H-W-W-W-H',
    category: 'major'
  },

  dorian: {
    name: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    degrees: ['1', '2', 'b3', '4', '5', '6', 'b7'],
    formula: 'W-H-W-W-W-H-W',
    category: 'modes',
    parentScale: 'major',
    modeNumber: 2
  },

  phrygian: {
    name: 'Phrygian',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    degrees: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'],
    formula: 'H-W-W-W-H-W-W',
    category: 'modes',
    parentScale: 'major',
    modeNumber: 3
  },

  lydian: {
    name: 'Lydian',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    degrees: ['1', '2', '3', '#4', '5', '6', '7'],
    formula: 'W-W-W-H-W-W-H',
    category: 'modes',
    parentScale: 'major',
    modeNumber: 4
  },

  mixolydian: {
    name: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    degrees: ['1', '2', '3', '4', '5', '6', 'b7'],
    formula: 'W-W-H-W-W-H-W',
    category: 'modes',
    parentScale: 'major',
    modeNumber: 5
  },

  aeolian: {
    name: 'Aeolian (Natural Minor)',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degrees: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
    formula: 'W-H-W-W-H-W-W',
    category: 'minor',
    parentScale: 'major',
    modeNumber: 6
  },

  locrian: {
    name: 'Locrian',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    degrees: ['1', 'b2', 'b3', '4', 'b5', 'b6', 'b7'],
    formula: 'H-W-W-H-W-W-W',
    category: 'modes',
    parentScale: 'major',
    modeNumber: 7
  },

  // Minor scales
  naturalMinor: {
    name: 'Natural Minor',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    degrees: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
    formula: 'W-H-W-W-H-W-W',
    category: 'minor'
  },

  harmonicMinor: {
    name: 'Harmonic Minor',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    degrees: ['1', '2', 'b3', '4', '5', 'b6', '7'],
    formula: 'W-H-W-W-H-WH-H',
    category: 'minor'
  },

  melodicMinor: {
    name: 'Melodic Minor',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    degrees: ['1', '2', 'b3', '4', '5', '6', '7'],
    formula: 'W-H-W-W-W-W-H',
    category: 'minor'
  },

  // Pentatonic scales
  majorPentatonic: {
    name: 'Major Pentatonic',
    intervals: [0, 2, 4, 7, 9],
    degrees: ['1', '2', '3', '5', '6'],
    formula: 'W-W-m3-W-m3',
    category: 'pentatonic'
  },

  minorPentatonic: {
    name: 'Minor Pentatonic',
    intervals: [0, 3, 5, 7, 10],
    degrees: ['1', 'b3', '4', '5', 'b7'],
    formula: 'm3-W-W-m3-W',
    category: 'pentatonic'
  },

  // Blues scale
  blues: {
    name: 'Blues Scale',
    intervals: [0, 3, 5, 6, 7, 10],
    degrees: ['1', 'b3', '4', 'b5', '5', 'b7'],
    formula: 'm3-W-H-H-m3-W',
    category: 'blues'
  },

  // Exotic scales
  harmonicMajor: {
    name: 'Harmonic Major',
    intervals: [0, 2, 4, 5, 7, 8, 11],
    degrees: ['1', '2', '3', '4', '5', 'b6', '7'],
    formula: 'W-W-H-W-H-WH-H',
    category: 'exotic'
  },

  hungarianMinor: {
    name: 'Hungarian Minor',
    intervals: [0, 2, 3, 6, 7, 8, 11],
    degrees: ['1', '2', 'b3', '#4', '5', 'b6', '7'],
    formula: 'W-H-WH-H-H-WH-H',
    category: 'exotic'
  },

  doubleHarmonic: {
    name: 'Double Harmonic (Byzantine)',
    intervals: [0, 1, 4, 5, 7, 8, 11],
    degrees: ['1', 'b2', '3', '4', '5', 'b6', '7'],
    formula: 'H-WH-H-W-H-WH-H',
    category: 'exotic'
  },

  neapolitanMinor: {
    name: 'Neapolitan Minor',
    intervals: [0, 1, 3, 5, 7, 8, 11],
    degrees: ['1', 'b2', 'b3', '4', '5', 'b6', '7'],
    formula: 'H-W-W-W-H-WH-H',
    category: 'exotic'
  },

  neapolitanMajor: {
    name: 'Neapolitan Major',
    intervals: [0, 1, 3, 5, 7, 9, 11],
    degrees: ['1', 'b2', 'b3', '4', '5', '6', '7'],
    formula: 'H-W-W-W-W-W-H',
    category: 'exotic'
  },

  enigmatic: {
    name: 'Enigmatic Scale',
    intervals: [0, 1, 4, 6, 8, 10, 11],
    degrees: ['1', 'b2', '3', '#4', '#5', '#6', '7'],
    formula: 'H-WH-W-W-W-H-H',
    category: 'exotic'
  },

  persian: {
    name: 'Persian Scale',
    intervals: [0, 1, 4, 5, 6, 8, 11],
    degrees: ['1', 'b2', '3', '4', 'b5', 'b6', '7'],
    formula: 'H-WH-H-H-W-WH-H',
    category: 'exotic'
  },

  altered: {
    name: 'Altered Scale (Super Locrian)',
    intervals: [0, 1, 3, 4, 6, 8, 10],
    degrees: ['1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7'],
    formula: 'H-W-H-W-W-W-W',
    category: 'exotic'
  },

  wholeTone: {
    name: 'Whole Tone Scale',
    intervals: [0, 2, 4, 6, 8, 10],
    degrees: ['1', '2', '3', '#4', '#5', 'b7'],
    formula: 'W-W-W-W-W-W',
    category: 'exotic'
  },

  diminished: {
    name: 'Diminished Scale (Whole-Half)',
    intervals: [0, 2, 3, 5, 6, 8, 9, 11],
    degrees: ['1', '2', 'b3', '4', 'b5', '#5', '6', '7'],
    formula: 'W-H-W-H-W-H-W-H',
    category: 'exotic'
  },

  halfWholeDiminished: {
    name: 'Half-Whole Diminished',
    intervals: [0, 1, 3, 4, 6, 7, 9, 10],
    degrees: ['1', 'b2', 'b3', '3', '#4', '5', '6', 'b7'],
    formula: 'H-W-H-W-H-W-H-W',
    category: 'exotic'
  },

  augmented: {
    name: 'Augmented Scale',
    intervals: [0, 3, 4, 7, 8, 11],
    degrees: ['1', '#2', '3', '#4', '5', '#6'],
    formula: 'm3-H-m3-H-m3-H',
    category: 'exotic'
  },

  prometheus: {
    name: 'Prometheus Scale',
    intervals: [0, 2, 4, 6, 9, 10],
    degrees: ['1', '2', '3', '#4', '6', 'b7'],
    formula: 'W-W-W-m3-H-m3',
    category: 'exotic'
  },

  hirajoshi: {
    name: 'Hirajoshi Scale',
    intervals: [0, 2, 3, 7, 8],
    degrees: ['1', '2', 'b3', '5', 'b6'],
    formula: 'W-H-M3-H-M3',
    category: 'exotic'
  },

  inSen: {
    name: 'In-Sen Scale',
    intervals: [0, 1, 5, 7, 10],
    degrees: ['1', 'b2', '4', '5', 'b7'],
    formula: 'H-M3-W-m3-W',
    category: 'exotic'
  },

  iwato: {
    name: 'Iwato Scale',
    intervals: [0, 1, 5, 6, 10],
    degrees: ['1', 'b2', '4', 'b5', 'b7'],
    formula: 'H-M3-H-M3-W',
    category: 'exotic'
  },

  yo: {
    name: 'Yo Scale',
    intervals: [0, 2, 5, 7, 9],
    degrees: ['1', '2', '4', '5', '6'],
    formula: 'W-m3-W-W-m3',
    category: 'exotic'
  },

  spanish: {
    name: 'Spanish Scale (Phrygian Dominant)',
    intervals: [0, 1, 4, 5, 7, 8, 10],
    degrees: ['1', 'b2', '3', '4', '5', 'b6', 'b7'],
    formula: 'H-WH-H-W-H-W-W',
    category: 'exotic'
  },

  jewish: {
    name: 'Jewish Scale (Ahava Rabboh)',
    intervals: [0, 1, 4, 5, 7, 8, 10],
    degrees: ['1', 'b2', '3', '4', '5', 'b6', 'b7'],
    formula: 'H-WH-H-W-H-W-W',
    category: 'exotic'
  },

  arabic: {
    name: 'Arabic Scale',
    intervals: [0, 2, 4, 5, 6, 8, 10],
    degrees: ['1', '2', '3', '4', 'b5', 'b6', 'b7'],
    formula: 'W-W-H-H-W-W-W',
    category: 'exotic'
  },

  egyptian: {
    name: 'Egyptian Scale',
    intervals: [0, 2, 5, 7, 10],
    degrees: ['1', '2', '4', '5', 'b7'],
    formula: 'W-m3-W-m3-W',
    category: 'exotic'
  }
};

// Get all scale names grouped by category
export function getScalesByCategory() {
  const categories = {
    major: [],
    minor: [],
    pentatonic: [],
    blues: [],
    modes: [],
    exotic: []
  };

  Object.entries(SCALE_PATTERNS).forEach(([key, scale]) => {
    categories[scale.category].push({ key, ...scale });
  });

  return categories;
}

// Get scale pattern by key
export function getScalePattern(scaleKey) {
  return SCALE_PATTERNS[scaleKey];
}

// Get all scale keys
export function getAllScaleKeys() {
  return Object.keys(SCALE_PATTERNS);
}
