// Guitar chord shape library with common voicings
// Format: [string 6, string 5, string 4, string 3, string 2, string 1] (low E to high E)
// -1 = muted, 0 = open, 1+ = fret number

export const CHORD_SHAPES = {
  // Major chords
  major: [
    {
      name: 'E shape',
      root: 'E',
      frets: [0, 2, 2, 1, 0, 0],
      fingers: [0, 2, 3, 1, 0, 0],
      baseFret: 0,
      rootString: 6
    },
    {
      name: 'A shape',
      root: 'A',
      frets: [-1, 0, 2, 2, 2, 0],
      fingers: [0, 0, 1, 2, 3, 0],
      baseFret: 0,
      rootString: 5
    },
    {
      name: 'D shape',
      root: 'D',
      frets: [-1, -1, 0, 2, 3, 2],
      fingers: [0, 0, 0, 1, 3, 2],
      baseFret: 0,
      rootString: 4
    },
    {
      name: 'C shape',
      root: 'C',
      frets: [-1, 3, 2, 0, 1, 0],
      fingers: [0, 3, 2, 0, 1, 0],
      baseFret: 0,
      rootString: 5
    },
    {
      name: 'G shape',
      root: 'G',
      frets: [3, 2, 0, 0, 0, 3],
      fingers: [3, 2, 0, 0, 0, 4],
      baseFret: 0,
      rootString: 6
    }
  ],

  // Minor chords
  minor: [
    {
      name: 'Em shape',
      root: 'E',
      frets: [0, 2, 2, 0, 0, 0],
      fingers: [0, 2, 3, 0, 0, 0],
      baseFret: 0,
      rootString: 6
    },
    {
      name: 'Am shape',
      root: 'A',
      frets: [-1, 0, 2, 2, 1, 0],
      fingers: [0, 0, 2, 3, 1, 0],
      baseFret: 0,
      rootString: 5
    },
    {
      name: 'Dm shape',
      root: 'D',
      frets: [-1, -1, 0, 2, 3, 1],
      fingers: [0, 0, 0, 2, 3, 1],
      baseFret: 0,
      rootString: 4
    }
  ],

  // Dominant 7th chords
  dominant7: [
    {
      name: 'E7 shape',
      root: 'E',
      frets: [0, 2, 0, 1, 0, 0],
      fingers: [0, 2, 0, 1, 0, 0],
      baseFret: 0,
      rootString: 6
    },
    {
      name: 'A7 shape',
      root: 'A',
      frets: [-1, 0, 2, 0, 2, 0],
      fingers: [0, 0, 2, 0, 3, 0],
      baseFret: 0,
      rootString: 5
    },
    {
      name: 'D7 shape',
      root: 'D',
      frets: [-1, -1, 0, 2, 1, 2],
      fingers: [0, 0, 0, 2, 1, 3],
      baseFret: 0,
      rootString: 4
    },
    {
      name: 'C7 shape',
      root: 'C',
      frets: [-1, 3, 2, 3, 1, 0],
      fingers: [0, 3, 2, 4, 1, 0],
      baseFret: 0,
      rootString: 5
    }
  ],

  // Major 7th chords
  major7: [
    {
      name: 'Emaj7 shape',
      root: 'E',
      frets: [0, 2, 1, 1, 0, 0],
      fingers: [0, 3, 1, 2, 0, 0],
      baseFret: 0,
      rootString: 6
    },
    {
      name: 'Amaj7 shape',
      root: 'A',
      frets: [-1, 0, 2, 1, 2, 0],
      fingers: [0, 0, 2, 1, 3, 0],
      baseFret: 0,
      rootString: 5
    },
    {
      name: 'Dmaj7 shape',
      root: 'D',
      frets: [-1, -1, 0, 2, 2, 2],
      fingers: [0, 0, 0, 1, 1, 1],
      baseFret: 0,
      rootString: 4
    },
    {
      name: 'Cmaj7 shape',
      root: 'C',
      frets: [-1, 3, 2, 0, 0, 0],
      fingers: [0, 3, 2, 0, 0, 0],
      baseFret: 0,
      rootString: 5
    }
  ],

  // Minor 7th chords
  minor7: [
    {
      name: 'Em7 shape',
      root: 'E',
      frets: [0, 2, 0, 0, 0, 0],
      fingers: [0, 2, 0, 0, 0, 0],
      baseFret: 0,
      rootString: 6
    },
    {
      name: 'Am7 shape',
      root: 'A',
      frets: [-1, 0, 2, 0, 1, 0],
      fingers: [0, 0, 2, 0, 1, 0],
      baseFret: 0,
      rootString: 5
    },
    {
      name: 'Dm7 shape',
      root: 'D',
      frets: [-1, -1, 0, 2, 1, 1],
      fingers: [0, 0, 0, 2, 1, 1],
      baseFret: 0,
      rootString: 4
    }
  ],

  // Diminished chords
  diminished: [
    {
      name: 'Edim shape',
      root: 'E',
      frets: [-1, -1, 2, 3, 2, 3],
      fingers: [0, 0, 1, 3, 2, 4],
      baseFret: 0,
      rootString: 4
    },
    {
      name: 'Adim shape',
      root: 'A',
      frets: [-1, 0, 1, 2, 1, 2],
      fingers: [0, 0, 1, 3, 2, 4],
      baseFret: 0,
      rootString: 5
    }
  ],

  // Half-diminished (m7b5) chords
  halfDiminished7: [
    {
      name: 'Em7b5 shape',
      root: 'E',
      frets: [0, 1, 2, 0, 3, 0],
      fingers: [0, 1, 2, 0, 3, 0],
      baseFret: 0,
      rootString: 6
    },
    {
      name: 'Am7b5 shape',
      root: 'A',
      frets: [-1, 0, 1, 0, 1, 0],
      fingers: [0, 0, 1, 0, 2, 0],
      baseFret: 0,
      rootString: 5
    }
  ]
};

/**
 * Get chord shapes for a specific chord quality
 */
export function getShapesForQuality(quality) {
  // Normalize quality names
  const normalizedQuality = quality.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (normalizedQuality.includes('major7') || normalizedQuality === 'maj7') {
    return CHORD_SHAPES.major7;
  } else if (normalizedQuality.includes('minor7') || normalizedQuality === 'm7') {
    return CHORD_SHAPES.minor7;
  } else if (normalizedQuality.includes('dominant7') || normalizedQuality === '7') {
    return CHORD_SHAPES.dominant7;
  } else if (normalizedQuality.includes('halfdiminished7') || normalizedQuality === 'm7b5') {
    return CHORD_SHAPES.halfDiminished7;
  } else if (normalizedQuality.includes('diminished')) {
    return CHORD_SHAPES.diminished;
  } else if (normalizedQuality.includes('minor')) {
    return CHORD_SHAPES.minor;
  } else if (normalizedQuality.includes('major') || normalizedQuality === '') {
    return CHORD_SHAPES.major;
  }

  return CHORD_SHAPES.major; // Default to major
}

/**
 * Transpose a chord shape to a different root
 */
export function transposeShape(shape, targetRoot, tuning = ['E', 'A', 'D', 'G', 'B', 'E']) {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const shapeRootIndex = notes.indexOf(shape.root);
  const targetRootIndex = notes.indexOf(targetRoot);

  if (shapeRootIndex === -1 || targetRootIndex === -1) {
    return null;
  }

  const semitoneShift = (targetRootIndex - shapeRootIndex + 12) % 12;

  // Transpose the shape
  const transposedFrets = shape.frets.map(fret => {
    if (fret < 0) return fret; // Keep muted strings muted
    return fret + semitoneShift;
  });

  // Find the best position (don't go too high on the neck)
  const maxFret = Math.max(...transposedFrets.filter(f => f >= 0));
  let baseFretAdjustment = 0;

  // If the chord goes beyond fret 12, try to find a better position
  if (maxFret > 12) {
    baseFretAdjustment = -12;
  }

  const finalFrets = transposedFrets.map(fret => {
    if (fret < 0) return fret;
    const adjusted = fret + baseFretAdjustment;
    return adjusted < 0 ? -1 : adjusted;
  });

  // Calculate base fret (lowest non-zero fret)
  const nonZeroFrets = finalFrets.filter(f => f > 0);
  const baseFret = nonZeroFrets.length > 0 ? Math.min(...nonZeroFrets) : 0;

  return {
    ...shape,
    root: targetRoot,
    frets: finalFrets,
    baseFret: baseFret > 0 ? baseFret : 0
  };
}

/**
 * Get multiple voicings for a chord
 */
export function getChordVoicings(chordRoot, chordQuality, maxVoicings = 4) {
  const shapes = getShapesForQuality(chordQuality);
  const voicings = [];

  for (const shape of shapes) {
    const transposed = transposeShape(shape, chordRoot);
    if (transposed) {
      // Only include voicings that are playable (not too high on neck)
      const maxFret = Math.max(...transposed.frets.filter(f => f >= 0));
      if (maxFret <= 15) {
        voicings.push(transposed);
      }
    }

    if (voicings.length >= maxVoicings) break;
  }

  return voicings;
}
