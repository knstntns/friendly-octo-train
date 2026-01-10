// Scale generation and manipulation engine

import { NOTES, TUNINGS } from '../data/constants.js';
import { getScalePattern } from '../data/scales.js';
import {
  transposeNote,
  getNoteAtFret,
  getNoteIndex,
  getProperNoteName
} from './MusicTheory.js';

export class ScaleEngine {
  constructor() {
    this.currentRoot = 'C';
    this.currentScaleType = 'major';
    this.currentScale = null;
  }

  /**
   * Generate a scale from root note and scale type
   */
  generateScale(root, scaleType) {
    const pattern = getScalePattern(scaleType);

    if (!pattern) {
      console.error(`Scale type '${scaleType}' not found`);
      return null;
    }

    const notes = pattern.intervals.map(interval => {
      const note = transposeNote(root, interval);
      return getProperNoteName(note, root);
    });

    const scale = {
      root: root,
      type: scaleType,
      name: pattern.name,
      notes: notes,
      degrees: pattern.degrees,
      intervals: pattern.intervals,
      formula: pattern.formula,
      category: pattern.category
    };

    this.currentScale = scale;
    this.currentRoot = root;
    this.currentScaleType = scaleType;

    return scale;
  }

  /**
   * Transpose current scale to a new root
   */
  transpose(newRoot) {
    if (!this.currentScaleType) {
      console.error('No scale loaded to transpose');
      return null;
    }

    return this.generateScale(newRoot, this.currentScaleType);
  }

  /**
   * Change the scale type while keeping the same root
   */
  changeScaleType(newScaleType) {
    if (!this.currentRoot) {
      console.error('No root note set');
      return null;
    }

    return this.generateScale(this.currentRoot, newScaleType);
  }

  /**
   * Get all positions of the current scale on the fretboard
   */
  getFretboardPositions(scale = null, tuning = TUNINGS.standard, maxFret = 24) {
    const scaleToUse = scale || this.currentScale;

    if (!scaleToUse) {
      console.error('No scale to display');
      return [];
    }

    const positions = [];

    tuning.forEach((openString, stringIndex) => {
      for (let fret = 0; fret <= maxFret; fret++) {
        const noteAtFret = getNoteAtFret(openString, fret);
        const noteIndex = getNoteIndex(noteAtFret);

        // Check if this note is in the scale
        const scaleNoteIndex = scaleToUse.notes.findIndex(
          scaleNote => getNoteIndex(scaleNote) === noteIndex
        );

        if (scaleNoteIndex !== -1) {
          positions.push({
            string: stringIndex + 1,
            fret: fret,
            note: scaleToUse.notes[scaleNoteIndex],
            degree: scaleToUse.degrees[scaleNoteIndex],
            interval: scaleToUse.intervals[scaleNoteIndex],
            isRoot: scaleToUse.notes[scaleNoteIndex] === scaleToUse.root ||
                   getNoteIndex(scaleToUse.notes[scaleNoteIndex]) === getNoteIndex(scaleToUse.root)
          });
        }
      }
    });

    return positions;
  }

  /**
   * Get scale positions within a specific fret range
   */
  getPositionsInRange(startFret, endFret, scale = null, tuning = TUNINGS.standard) {
    const allPositions = this.getFretboardPositions(scale, tuning, endFret);
    return allPositions.filter(pos => pos.fret >= startFret && pos.fret <= endFret);
  }

  /**
   * Get scale positions for a specific position/box pattern
   * Common guitar scale positions (CAGED system, 3-notes-per-string, etc.)
   */
  getPositionPattern(patternNumber, scale = null, tuning = TUNINGS.standard) {
    const scaleToUse = scale || this.currentScale;

    if (!scaleToUse) {
      console.error('No scale loaded');
      return [];
    }

    // Find the root note positions to determine box positions
    const rootPositions = this.getFretboardPositions(scaleToUse, tuning)
      .filter(pos => pos.isRoot);

    if (rootPositions.length === 0) return [];

    // Group positions by approximate fret range (patterns are usually 4-5 frets wide)
    const patternWidth = 4;
    const patterns = [];
    const processedFrets = new Set();

    rootPositions.forEach(rootPos => {
      if (processedFrets.has(rootPos.fret)) return;

      const startFret = Math.max(0, rootPos.fret - 1);
      const endFret = startFret + patternWidth;

      const patternPositions = this.getPositionsInRange(
        startFret,
        endFret,
        scaleToUse,
        tuning
      );

      patterns.push({
        startFret,
        endFret,
        positions: patternPositions
      });

      processedFrets.add(rootPos.fret);
    });

    // Return the requested pattern number
    return patterns[patternNumber - 1] || patterns[0];
  }

  /**
   * Get the current scale
   */
  getCurrentScale() {
    return this.currentScale;
  }

  /**
   * Get scale degree for a specific note in the current scale
   */
  getDegreeForNote(note) {
    if (!this.currentScale) return null;

    const noteIndex = getNoteIndex(note);
    const scaleNoteIndex = this.currentScale.notes.findIndex(
      scaleNote => getNoteIndex(scaleNote) === noteIndex
    );

    return scaleNoteIndex !== -1 ? this.currentScale.degrees[scaleNoteIndex] : null;
  }

  /**
   * Check if a note is in the current scale
   */
  isNoteInScale(note, scale = null) {
    const scaleToUse = scale || this.currentScale;
    if (!scaleToUse) return false;

    const noteIndex = getNoteIndex(note);
    return scaleToUse.notes.some(
      scaleNote => getNoteIndex(scaleNote) === noteIndex
    );
  }

  /**
   * Get the relative major/minor scale
   */
  getRelativeScale(scale = null) {
    const scaleToUse = scale || this.currentScale;
    if (!scaleToUse) return null;

    // For minor scales, the relative major is a minor third (3 semitones) up
    // For major scales, the relative minor is a minor third down (9 semitones up)
    if (scaleToUse.category === 'minor') {
      const relativeMajorRoot = transposeNote(scaleToUse.root, 3);
      return this.generateScale(relativeMajorRoot, 'major');
    } else if (scaleToUse.category === 'major') {
      const relativeMinorRoot = transposeNote(scaleToUse.root, 9);
      return this.generateScale(relativeMinorRoot, 'naturalMinor');
    }

    return null;
  }

  /**
   * Get parallel major/minor scale (same root, different quality)
   */
  getParallelScale(scale = null) {
    const scaleToUse = scale || this.currentScale;
    if (!scaleToUse) return null;

    if (scaleToUse.category === 'minor') {
      return this.generateScale(scaleToUse.root, 'major');
    } else if (scaleToUse.category === 'major') {
      return this.generateScale(scaleToUse.root, 'naturalMinor');
    }

    return null;
  }

  /**
   * Get mode from major scale
   */
  getMode(modeNumber, root = null) {
    const rootToUse = root || this.currentRoot;

    const modeNames = [
      'major',      // Ionian (mode 1)
      'dorian',     // mode 2
      'phrygian',   // mode 3
      'lydian',     // mode 4
      'mixolydian', // mode 5
      'aeolian',    // mode 6
      'locrian'     // mode 7
    ];

    const modeIndex = modeNumber - 1;
    if (modeIndex < 0 || modeIndex >= modeNames.length) {
      console.error('Invalid mode number (1-7)');
      return null;
    }

    return this.generateScale(rootToUse, modeNames[modeIndex]);
  }

  /**
   * Get all modes of the current scale
   */
  getAllModes(scale = null) {
    const scaleToUse = scale || this.currentScale;
    if (!scaleToUse) return [];

    const modes = [];
    for (let i = 1; i <= 7; i++) {
      const modeRoot = scaleToUse.notes[i - 1];
      modes.push(this.getMode(i, modeRoot));
    }

    return modes;
  }
}

export default ScaleEngine;
