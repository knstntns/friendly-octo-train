// Musical constants for guitar scales app

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const ALTERNATE_NAMES = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb'
};

export const TUNINGS = {
  standard: ['E', 'A', 'D', 'G', 'B', 'E'],
  dropD: ['D', 'A', 'D', 'G', 'B', 'E'],
  halfStepDown: ['D#', 'G#', 'C#', 'F#', 'A#', 'D#'],
  wholestepDown: ['D', 'G', 'C', 'F', 'A', 'D'],
  dropC: ['C', 'G', 'C', 'F', 'A', 'D'],
  openG: ['D', 'G', 'D', 'G', 'B', 'D'],
  openD: ['D', 'A', 'D', 'F#', 'A', 'D'],
  dadgad: ['D', 'A', 'D', 'G', 'A', 'D']
};

export const INTERVAL_NAMES = {
  0: 'P1',   // Perfect Unison
  1: 'm2',   // Minor Second
  2: 'M2',   // Major Second
  3: 'm3',   // Minor Third
  4: 'M3',   // Major Third
  5: 'P4',   // Perfect Fourth
  6: 'TT',   // Tritone
  7: 'P5',   // Perfect Fifth
  8: 'm6',   // Minor Sixth
  9: 'M6',   // Major Sixth
  10: 'm7',  // Minor Seventh
  11: 'M7'   // Major Seventh
};

export const CHORD_QUALITIES = {
  major: '',
  minor: 'm',
  diminished: 'dim',
  augmented: 'aug',
  major7: 'maj7',
  minor7: 'm7',
  dominant7: '7',
  diminished7: 'dim7',
  halfDiminished7: 'm7b5',
  augmented7: 'aug7',
  minorMajor7: 'mMaj7'
};

export const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
export const DOUBLE_MARKERS = [12, 24];

export const DEFAULT_SETTINGS = {
  tuning: 'standard',
  maxFret: 24,
  displayMode: 'notes', // 'notes', 'degrees', 'intervals'
  highlightRoots: true,
  showChordTones: false,
  animationSpeed: 300
};
