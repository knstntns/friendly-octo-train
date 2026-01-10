// Core music theory calculations and utilities

import { NOTES, ALTERNATE_NAMES, INTERVAL_NAMES } from '../data/constants.js';

/**
 * Get the index of a note in the chromatic scale
 */
export function getNoteIndex(note) {
  let index = NOTES.indexOf(note);

  // Check alternate names if not found
  if (index === -1) {
    const sharpVersion = Object.keys(ALTERNATE_NAMES).find(
      key => ALTERNATE_NAMES[key] === note
    );
    if (sharpVersion) {
      index = NOTES.indexOf(sharpVersion);
    }
  }

  return index;
}

/**
 * Transpose a note by a number of semitones
 */
export function transposeNote(note, semitones) {
  const index = getNoteIndex(note);
  if (index === -1) return null;

  const newIndex = (index + semitones + 12) % 12;
  return NOTES[newIndex];
}

/**
 * Get the interval in semitones between two notes
 */
export function getInterval(note1, note2) {
  const index1 = getNoteIndex(note1);
  const index2 = getNoteIndex(note2);

  if (index1 === -1 || index2 === -1) return null;

  return (index2 - index1 + 12) % 12;
}

/**
 * Get the interval name (P1, M2, m3, etc.)
 */
export function getIntervalName(semitones) {
  return INTERVAL_NAMES[semitones] || 'Unknown';
}

/**
 * Convert a note to its enharmonic equivalent
 */
export function getEnharmonic(note) {
  if (ALTERNATE_NAMES[note]) {
    return ALTERNATE_NAMES[note];
  }

  const sharpVersion = Object.keys(ALTERNATE_NAMES).find(
    key => ALTERNATE_NAMES[key] === note
  );

  return sharpVersion || note;
}

/**
 * Check if a note is a sharp note
 */
export function isSharpNote(note) {
  return note.includes('#');
}

/**
 * Check if a note is a flat note
 */
export function isFlatNote(note) {
  return note.includes('b');
}

/**
 * Normalize note name (prefer sharps by default)
 */
export function normalizeNote(note, preferFlats = false) {
  const index = getNoteIndex(note);
  if (index === -1) return note;

  const sharpNote = NOTES[index];

  if (!preferFlats || !sharpNote.includes('#')) {
    return sharpNote;
  }

  return ALTERNATE_NAMES[sharpNote] || sharpNote;
}

/**
 * Get all notes in a chromatic scale starting from a root
 */
export function getChromaticScale(root) {
  const startIndex = getNoteIndex(root);
  if (startIndex === -1) return [];

  const scale = [];
  for (let i = 0; i < 12; i++) {
    scale.push(NOTES[(startIndex + i) % 12]);
  }

  return scale;
}

/**
 * Determine if we should use sharps or flats for a given key
 * This helps with proper note naming in different keys
 */
export function shouldUseFlats(root) {
  const flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];
  return flatKeys.includes(root);
}

/**
 * Get proper note name for a key signature
 */
export function getProperNoteName(note, root) {
  const useFlats = shouldUseFlats(root);
  return normalizeNote(note, useFlats);
}

/**
 * Calculate the frequency of a note (A4 = 440 Hz)
 */
export function getNoteFrequency(note, octave = 4) {
  const noteIndex = getNoteIndex(note);
  if (noteIndex === -1) return null;

  // A4 is the reference (440 Hz)
  const aIndex = NOTES.indexOf('A');
  const semitonesFromA4 = (octave - 4) * 12 + (noteIndex - aIndex);

  return 440 * Math.pow(2, semitonesFromA4 / 12);
}

/**
 * Get the note at a specific fret on a string
 */
export function getNoteAtFret(openString, fret) {
  return transposeNote(openString, fret);
}

/**
 * Find all positions of a note on the fretboard
 */
export function findNotePositions(note, tuning, maxFret = 24) {
  const positions = [];
  const targetIndex = getNoteIndex(note);

  if (targetIndex === -1) return positions;

  tuning.forEach((openString, stringIndex) => {
    for (let fret = 0; fret <= maxFret; fret++) {
      const fretNote = getNoteAtFret(openString, fret);
      if (getNoteIndex(fretNote) === targetIndex) {
        positions.push({
          string: stringIndex + 1,
          fret: fret,
          note: fretNote
        });
      }
    }
  });

  return positions;
}

/**
 * Validate if a note name is valid
 */
export function isValidNote(note) {
  return getNoteIndex(note) !== -1;
}

/**
 * Get the circle of fifths sequence
 */
export function getCircleOfFifths() {
  const circle = ['C'];
  for (let i = 0; i < 11; i++) {
    const lastNote = circle[circle.length - 1];
    circle.push(transposeNote(lastNote, 7));
  }
  return circle;
}

/**
 * Get the circle of fourths sequence
 */
export function getCircleOfFourths() {
  const circle = ['C'];
  for (let i = 0; i < 11; i++) {
    const lastNote = circle[circle.length - 1];
    circle.push(transposeNote(lastNote, 5));
  }
  return circle;
}

/**
 * Calculate interval quality (major, minor, perfect, augmented, diminished)
 */
export function getIntervalQuality(semitones) {
  const qualities = {
    0: 'Perfect Unison',
    1: 'Minor Second',
    2: 'Major Second',
    3: 'Minor Third',
    4: 'Major Third',
    5: 'Perfect Fourth',
    6: 'Tritone',
    7: 'Perfect Fifth',
    8: 'Minor Sixth',
    9: 'Major Sixth',
    10: 'Minor Seventh',
    11: 'Major Seventh'
  };

  return qualities[semitones] || 'Unknown';
}

/**
 * Sort notes by their position in the chromatic scale
 */
export function sortNotes(notes, startNote = 'C') {
  const startIndex = getNoteIndex(startNote);

  return [...notes].sort((a, b) => {
    const indexA = (getNoteIndex(a) - startIndex + 12) % 12;
    const indexB = (getNoteIndex(b) - startIndex + 12) % 12;
    return indexA - indexB;
  });
}

/**
 * Get unique notes from an array (removing octave duplicates)
 */
export function getUniqueNotes(notes) {
  const seen = new Set();
  return notes.filter(note => {
    const normalized = normalizeNote(note);
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}
