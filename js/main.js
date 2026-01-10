// Main application entry point

import { ScaleEngine } from './core/ScaleEngine.js';
import { ChordEngine } from './core/ChordEngine.js';
import { FretboardRenderer } from './ui/FretboardRenderer.js';
import { ControlPanel } from './ui/ControlPanel.js';
import { TUNINGS } from './data/constants.js';

class GuitarScalesApp {
  constructor() {
    this.scaleEngine = new ScaleEngine();
    this.chordEngine = new ChordEngine();
    this.fretboard = null;
    this.controlPanel = null;
    this.currentScale = null;
    this.currentChords = null;
    this.showChords = true;

    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    console.log('Initializing Guitar Scales App...');

    // Initialize fretboard renderer
    this.fretboard = new FretboardRenderer('fretboard-container', {
      numFrets: 15,
      fretWidth: 70,
      stringSpacing: 40,
      displayMode: 'notes',
      onNoteClick: (position) => this.handleNoteClick(position),
      onNoteHover: (position) => this.handleNoteHover(position)
    });

    // Initialize control panel
    this.controlPanel = new ControlPanel({
      onScaleChange: (data) => this.handleScaleChange(data),
      onKeyChange: (data) => this.handleKeyChange(data),
      onDisplayModeChange: (mode) => this.handleDisplayModeChange(mode),
      onChordClick: (chord) => this.handleChordClick(chord)
    });

    // Setup show chords toggle
    this.setupShowChordsToggle();

    // Load initial scale (C Major)
    this.loadScale('C', 'major');

    console.log('App initialized successfully!');
  }

  /**
   * Load and display a scale
   */
  loadScale(root, scaleType) {
    console.log(`Loading scale: ${root} ${scaleType}`);

    // Generate scale
    this.currentScale = this.scaleEngine.generateScale(root, scaleType);

    if (!this.currentScale) {
      console.error('Failed to generate scale');
      return;
    }

    // Get fretboard positions
    const positions = this.scaleEngine.getFretboardPositions(this.currentScale);

    // Update fretboard
    this.fretboard.updateNotes(positions);

    // Update scale info panel
    this.controlPanel.updateScaleInfo(this.currentScale);

    // Generate and display chords
    if (this.showChords) {
      this.generateChords();
    }
  }

  /**
   * Generate and display harmonized chords
   */
  generateChords() {
    if (!this.currentScale) return;

    // Generate triads and seventh chords
    const triads = this.chordEngine.harmonizeTriads(this.currentScale);
    const sevenths = this.chordEngine.harmonizeSeventhChords(this.currentScale);

    this.currentChords = { triads, sevenths };

    // Update chord panels
    this.controlPanel.updateChordPanel(this.currentChords);
    this.controlPanel.updateSeventhChordsPanel(this.currentChords);

    // Update progressions
    this.updateProgressions();
  }

  /**
   * Update common progressions panel
   */
  updateProgressions() {
    if (!this.currentScale) return;

    const progressionsPanel = document.getElementById('progressions-panel');
    if (!progressionsPanel) return;

    const progressions = this.chordEngine.getCommonProgressions(this.currentScale);

    const html = progressions.map(progression => `
      <div class="border border-gray-200 rounded-lg p-4 hover:border-blue-400 cursor-pointer transition-colors">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-semibold text-gray-800">${progression.name}</h3>
          <span class="text-xs text-gray-500">${progression.description}</span>
        </div>
        <div class="flex flex-wrap gap-2">
          ${progression.chords.map(chord => `
            <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              ${chord.symbol}
            </span>
          `).join('')}
        </div>
      </div>
    `).join('');

    progressionsPanel.innerHTML = html;
  }

  /**
   * Handle scale type change
   */
  handleScaleChange(data) {
    console.log('Scale changed:', data);
    this.loadScale(data.key, data.scale);
  }

  /**
   * Handle key change
   */
  handleKeyChange(data) {
    console.log('Key changed:', data);
    this.loadScale(data.key, data.scale);
  }

  /**
   * Handle display mode change
   */
  handleDisplayModeChange(mode) {
    console.log('Display mode changed:', mode);
    this.fretboard.setDisplayMode(mode);
  }

  /**
   * Handle note click on fretboard
   */
  handleNoteClick(position) {
    console.log('Note clicked:', position);

    // Find chords containing this note
    if (this.currentChords && this.currentChords.triads) {
      const containingChords = this.chordEngine.getChordsContainingNote(
        position.note,
        this.currentChords.triads
      );

      if (containingChords.length > 0) {
        console.log('Note appears in chords:', containingChords.map(c => c.symbol));
      }
    }
  }

  /**
   * Handle note hover on fretboard
   */
  handleNoteHover(position) {
    // Optional: Show tooltip or additional info
  }

  /**
   * Handle chord click
   */
  handleChordClick(chord) {
    console.log('Chord clicked:', chord);

    // Highlight chord tones on fretboard
    this.fretboard.highlightNotes(chord.notes);

    // Reset highlights after 2 seconds
    setTimeout(() => {
      this.fretboard.resetHighlights();
    }, 2000);
  }

  /**
   * Setup show chords toggle
   */
  setupShowChordsToggle() {
    const showChordsToggle = document.getElementById('show-chords');
    if (!showChordsToggle) return;

    showChordsToggle.addEventListener('change', (e) => {
      this.showChords = e.target.checked;

      const triadsSection = document.getElementById('triads-section');
      const seventhsSection = document.getElementById('sevenths-section');
      const progressionsSection = document.getElementById('progressions-section');

      if (this.showChords) {
        triadsSection.style.display = 'block';
        seventhsSection.style.display = 'block';
        progressionsSection.style.display = 'block';
        this.generateChords();
      } else {
        triadsSection.style.display = 'none';
        seventhsSection.style.display = 'none';
        progressionsSection.style.display = 'none';
      }
    });
  }

  /**
   * Save preferences to localStorage
   */
  savePreferences() {
    const prefs = {
      key: this.controlPanel.currentKey,
      scale: this.controlPanel.currentScale,
      displayMode: this.controlPanel.currentDisplayMode,
      showChords: this.showChords
    };

    localStorage.setItem('guitarScalesPrefs', JSON.stringify(prefs));
  }

  /**
   * Load preferences from localStorage
   */
  loadPreferences() {
    const saved = localStorage.getItem('guitarScalesPrefs');

    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        this.controlPanel.setSelection(prefs.key, prefs.scale, prefs.displayMode);
        this.showChords = prefs.showChords !== false;

        const showChordsToggle = document.getElementById('show-chords');
        if (showChordsToggle) {
          showChordsToggle.checked = this.showChords;
        }

        this.loadScale(prefs.key, prefs.scale);
      } catch (e) {
        console.error('Failed to load preferences:', e);
      }
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, starting app...');
  window.guitarScalesApp = new GuitarScalesApp();
});

// Save preferences before page unload
window.addEventListener('beforeunload', () => {
  if (window.guitarScalesApp) {
    window.guitarScalesApp.savePreferences();
  }
});
