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
    this.highlightTimeout = null;
    this.selectedChordCard = null;

    // Progression builder state
    this.currentProgression = [];
    this.mixLayersMode = false;
    this.progressionLayers = null;

    // Chord voicing state
    this.currentlyDisplayedChord = null;
    this.chordVoicingsModal = null;

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
      onChordClick: (chord, cardElement) => this.handleChordClick(chord, cardElement)
    });

    // Setup show chords toggle
    this.setupShowChordsToggle();

    // Setup progression builder
    this.setupProgressionBuilder();

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

    // Generate scale analysis
    const scaleAnalysis = this.scaleEngine.getScaleAnalysis(this.currentScale);

    // Update scale info panel
    this.controlPanel.updateScaleInfo(this.currentScale, scaleAnalysis);

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

    // Clear any pending highlights and selections when regenerating chords
    if (this.highlightTimeout) {
      clearTimeout(this.highlightTimeout);
      this.highlightTimeout = null;
    }
    this.selectedChordCard = null;

    // Generate triads and seventh chords
    const triads = this.chordEngine.harmonizeTriads(this.currentScale);
    const sevenths = this.chordEngine.harmonizeSeventhChords(this.currentScale);

    this.currentChords = { triads, sevenths };

    // Update chord panels
    this.controlPanel.updateChordPanel(this.currentChords);
    this.controlPanel.updateSeventhChordsPanel(this.currentChords);

    // Update progression builder
    this.updateProgressionBuilder();
  }

  /**
   * Setup progression builder controls
   */
  setupProgressionBuilder() {
    // Mix layers toggle
    const mixToggle = document.getElementById('mix-chords-toggle');
    if (mixToggle) {
      mixToggle.addEventListener('change', (e) => {
        this.mixLayersMode = e.target.checked;
        this.updateProgressionBuilder();
      });
    }

    // Clear progression button
    const clearButton = document.getElementById('clear-progression');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.currentProgression = [];
        this.updateCurrentProgressionDisplay();
      });
    }
  }

  /**
   * Update progression builder with three layers
   */
  updateProgressionBuilder() {
    if (!this.currentScale) return;

    // Get all three layers
    this.progressionLayers = this.chordEngine.getProgressionLayers(this.currentScale);

    // Update each layer
    this.updateSecondaryDominantsPanel();
    this.updateMainChordsPanel();
    this.updateModalInterchangePanel();
    this.updateExampleProgressions();
    this.updateCurrentProgressionDisplay();
  }

  /**
   * Update secondary dominants panel
   */
  updateSecondaryDominantsPanel() {
    const panel = document.getElementById('secondary-dominants-panel');
    if (!panel || !this.progressionLayers) return;

    const html = this.progressionLayers.secondaryDominants.map((chord, index) => `
      <div class="progression-chord-card bg-white border-2 border-orange-300 rounded-lg p-2 hover:border-orange-500 hover:shadow-md cursor-pointer transition-all" data-layer="secondary" data-index="${index}">
        <div class="text-center">
          <div class="text-base font-bold text-gray-900">${chord.symbol}</div>
          <div class="text-xs text-orange-600 mt-1">${chord.degree}</div>
          <div class="text-xs text-gray-400 mt-1">${chord.root}</div>
        </div>
      </div>
    `).join('');

    panel.innerHTML = html;

    // Add click handlers
    panel.querySelectorAll('.progression-chord-card').forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.dataset.index);
        this.handleProgressionChordClick(this.progressionLayers.secondaryDominants[index], 'secondary');
      });
    });
  }

  /**
   * Update main chords panel
   */
  updateMainChordsPanel() {
    const panel = document.getElementById('main-chords-panel');
    if (!panel || !this.progressionLayers) return;

    const html = this.progressionLayers.mainChords.map((chord, index) => `
      <div class="progression-chord-card bg-white border-2 border-blue-300 rounded-lg p-2 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all" data-layer="main" data-index="${index}">
        <div class="text-center">
          <div class="text-base font-bold text-gray-900">${chord.symbol}</div>
          <div class="text-xs text-blue-600 mt-1">${chord.degree}</div>
          <div class="text-xs text-gray-400 mt-1">${chord.quality}</div>
        </div>
      </div>
    `).join('');

    panel.innerHTML = html;

    // Add click handlers
    panel.querySelectorAll('.progression-chord-card').forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.dataset.index);
        this.handleProgressionChordClick(this.progressionLayers.mainChords[index], 'main');
      });
    });
  }

  /**
   * Update modal interchange panel
   */
  updateModalInterchangePanel() {
    const panel = document.getElementById('modal-interchange-panel');
    if (!panel || !this.progressionLayers) return;

    const html = this.progressionLayers.modalInterchange.map((chord, index) => `
      <div class="progression-chord-card bg-white border-2 border-purple-300 rounded-lg p-2 hover:border-purple-500 hover:shadow-md cursor-pointer transition-all" data-layer="modal" data-index="${index}">
        <div class="text-center">
          <div class="text-base font-bold text-gray-900">${chord.symbol}</div>
          <div class="text-xs text-purple-600 mt-1">${chord.degree}</div>
          <div class="text-xs text-gray-400 mt-1">${chord.root}</div>
        </div>
      </div>
    `).join('');

    panel.innerHTML = html;

    // Add click handlers
    panel.querySelectorAll('.progression-chord-card').forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.dataset.index);
        this.handleProgressionChordClick(this.progressionLayers.modalInterchange[index], 'modal');
      });
    });
  }

  /**
   * Handle clicking a chord in the progression builder
   */
  handleProgressionChordClick(chord, layer) {
    // Add chord to progression
    this.currentProgression.push({
      ...chord,
      layer: layer
    });

    // Update display
    this.updateCurrentProgressionDisplay();

    // Show chord voicing options
    this.showChordVoicings(chord);
  }

  /**
   * Update current progression display
   */
  updateCurrentProgressionDisplay() {
    const display = document.getElementById('current-progression');
    if (!display) return;

    if (this.currentProgression.length === 0) {
      display.innerHTML = '<span class="text-gray-400 text-sm">Click chords below to build your progression...</span>';
      return;
    }

    const layerColors = {
      secondary: 'bg-orange-100 text-orange-800 border-orange-300',
      main: 'bg-blue-100 text-blue-800 border-blue-300',
      modal: 'bg-purple-100 text-purple-800 border-purple-300'
    };

    const html = this.currentProgression.map((chord, index) => `
      <div class="flex items-center gap-1">
        <span class="px-3 py-1 ${layerColors[chord.layer]} border rounded-lg text-sm font-medium hover:shadow-md transition-shadow cursor-pointer" data-index="${index}">
          ${chord.symbol}
          <span class="text-xs opacity-70 ml-1">${chord.degree}</span>
        </span>
        ${index < this.currentProgression.length - 1 ? '<span class="text-gray-400">→</span>' : ''}
      </div>
    `).join('');

    display.innerHTML = html;

    // Add click handlers to remove chords
    display.querySelectorAll('[data-index]').forEach(element => {
      element.addEventListener('click', () => {
        const index = parseInt(element.dataset.index);
        this.currentProgression.splice(index, 1);
        this.updateCurrentProgressionDisplay();
      });
    });
  }

  /**
   * Update example progressions
   */
  updateExampleProgressions() {
    if (!this.currentScale) return;

    const panel = document.getElementById('example-progressions-panel');
    if (!panel) return;

    const examples = [
      {
        name: 'Am - F - G - C',
        description: 'Main chords only',
        chords: ['vi', 'IV', 'V', 'I']
      },
      {
        name: 'C - C7 - F - G',
        description: 'Add secondary dominant',
        chords: ['I', 'V/IV', 'IV', 'V']
      },
      {
        name: 'F - G - B♭ - C',
        description: 'Add modal interchange',
        chords: ['IV', 'V', 'bVII', 'I']
      },
      {
        name: 'C - C7 - F - A♭',
        description: 'Secondary dominant + modal interchange',
        chords: ['I', 'V/IV', 'IV', 'bVI']
      }
    ];

    const html = examples.map(example => `
      <div class="text-xs border border-gray-200 rounded-lg p-2 hover:border-gray-300 cursor-pointer transition-colors">
        <div class="flex justify-between items-center">
          <span class="font-semibold text-gray-800">${example.name}</span>
          <span class="text-gray-500">${example.description}</span>
        </div>
        <div class="mt-1 text-gray-600">
          ${example.chords.join(' → ')}
        </div>
      </div>
    `).join('');

    panel.innerHTML = html;
  }

  /**
   * Generate chord voicings for display
   * Returns common chord shapes on the guitar
   */
  generateChordVoicings(chord) {
    const voicings = [];
    const tuning = ['E', 'A', 'D', 'G', 'B', 'E'];

    // Define common chord shape patterns (root position, 1st inversion, etc.)
    // These are relative positions for major, minor, and 7th chords

    // For simplicity, generate 3-4 common positions across the fretboard
    const positions = [0, 3, 5, 7, 10, 12]; // Common root positions

    positions.forEach(startFret => {
      const shape = this.getChordShape(chord, startFret, tuning);
      if (shape && shape.frets.some(f => f >= 0)) {
        voicings.push(shape);
      }
    });

    return voicings.slice(0, 4); // Return up to 4 voicings
  }

  /**
   * Get a chord shape at a specific position
   */
  getChordShape(chord, rootFret, tuning) {
    const chordNotes = chord.notes.map(n => this.scaleEngine.constructor.getNoteIndex?.(n) ??
      ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(n));

    const shape = {
      name: chord.symbol,
      startFret: rootFret,
      frets: [],
      fingers: []
    };

    // For each string, find if it contains a chord tone within reasonable reach
    tuning.forEach((openString, stringIndex) => {
      const openNoteIndex = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(openString);
      let found = false;

      // Check frets within a 4-fret span from rootFret
      for (let fret = rootFret; fret <= rootFret + 4 && fret <= 15; fret++) {
        const noteIndex = (openNoteIndex + fret) % 12;
        if (chordNotes.includes(noteIndex)) {
          shape.frets.push(fret);
          found = true;
          break;
        }
      }

      if (!found) {
        shape.frets.push(-1); // Muted string
      }
    });

    return shape;
  }

  /**
   * Show chord voicings modal
   */
  showChordVoicings(chord) {
    this.currentlyDisplayedChord = chord;

    // Get or create modal
    let modal = document.getElementById('chord-voicings-modal');
    if (!modal) {
      modal = this.createChordVoicingsModal();
    }

    // Generate voicings
    const voicings = this.generateChordVoicings(chord);

    // Update modal content
    const voicingsContainer = modal.querySelector('#chord-voicings-container');
    voicingsContainer.innerHTML = `
      <div class="mb-4">
        <h3 class="text-2xl font-bold text-gray-900 mb-1">${chord.symbol}</h3>
        <p class="text-sm text-gray-600">
          ${chord.degree ? `Degree: ${chord.degree} | ` : ''}
          Notes: ${chord.notes.join(', ')}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-4">
        ${voicings.map((voicing, index) => this.renderChordDiagram(voicing, index)).join('')}
      </div>

      <div class="text-xs text-gray-500 text-center">
        Click outside or press ESC to close
      </div>
    `;

    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  /**
   * Create chord voicings modal
   */
  createChordVoicingsModal() {
    const modal = document.createElement('div');
    modal.id = 'chord-voicings-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <button id="close-voicings-modal" class="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <div id="chord-voicings-container">
          <!-- Content will be populated dynamically -->
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideChordVoicings();
      }
    });

    // Close button handler
    modal.querySelector('#close-voicings-modal').addEventListener('click', () => {
      this.hideChordVoicings();
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        this.hideChordVoicings();
      }
    });

    return modal;
  }

  /**
   * Hide chord voicings modal
   */
  hideChordVoicings() {
    const modal = document.getElementById('chord-voicings-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  /**
   * Render a chord diagram
   */
  renderChordDiagram(voicing, index) {
    const strings = 6;
    const frets = 5;

    // Determine if we need to show a starting fret number
    const minFret = Math.min(...voicing.frets.filter(f => f > 0));
    const displayStartFret = minFret > 4 ? minFret : 1;
    const adjustedFrets = voicing.frets.map(f => f < 0 ? -1 : f - displayStartFret + 1);

    return `
      <div class="border-2 border-gray-300 rounded-lg p-3 bg-gray-50 hover:border-blue-400 transition-colors cursor-pointer" onclick="window.guitarScalesApp.selectVoicing(${index})"
        <div class="text-center mb-2">
          <span class="text-sm font-semibold text-gray-700">Position ${index + 1}</span>
          ${displayStartFret > 1 ? `<span class="text-xs text-gray-500 ml-2">(${displayStartFret}fr)</span>` : ''}
        </div>
        <div class="chord-diagram mx-auto" style="width: 120px;">
          <svg viewBox="0 0 100 130" class="w-full h-auto">
            <!-- Fret board -->
            ${displayStartFret === 1 ? '<rect x="10" y="5" width="80" height="3" fill="#000" />' : ''}

            <!-- Frets -->
            ${Array.from({length: frets}, (_, i) => `
              <line x1="10" y1="${15 + i * 20}" x2="90" y2="${15 + i * 20}"
                    stroke="#666" stroke-width="1" />
            `).join('')}

            <!-- Strings -->
            ${Array.from({length: strings}, (_, i) => `
              <line x1="${15 + i * 15}" y1="5" x2="${15 + i * 15}" y2="95"
                    stroke="#666" stroke-width="${i === 0 || i === strings - 1 ? '2' : '1.5'}" />
            `).join('')}

            <!-- Finger positions -->
            ${adjustedFrets.map((fret, stringIndex) => {
              if (fret < 0) {
                // Muted string (X)
                return `<text x="${15 + stringIndex * 15}" y="3"
                          font-size="10" fill="#f44" text-anchor="middle" font-weight="bold">×</text>`;
              } else if (fret === 0) {
                // Open string (O)
                return `<circle cx="${15 + stringIndex * 15}" cy="0" r="4"
                          fill="none" stroke="#4CAF50" stroke-width="2" />`;
              } else {
                // Fretted note
                const y = 5 + (fret * 20) - 10;
                const isRoot = stringIndex === 0 || (voicing.frets[stringIndex] % 12) === (voicing.frets.find(f => f >= 0) % 12);
                return `<circle cx="${15 + stringIndex * 15}" cy="${y}" r="5"
                          fill="${isRoot ? '#2196F3' : '#666'}" stroke="#fff" stroke-width="1" />`;
              }
            }).join('')}

            <!-- Fret numbers -->
            ${adjustedFrets.map((fret, stringIndex) =>
              fret > 0 ? `<text x="${15 + stringIndex * 15}" y="${5 + (fret * 20) - 7}"
                            font-size="6" fill="#fff" text-anchor="middle" font-weight="bold">${fret}</text>` : ''
            ).join('')}
          </svg>

          <!-- String labels -->
          <div class="flex justify-between text-xs text-gray-500 mt-1 px-1">
            <span>E</span>
            <span>A</span>
            <span>D</span>
            <span>G</span>
            <span>B</span>
            <span>E</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Select a chord voicing and highlight it on the main fretboard
   */
  selectVoicing(voicingIndex) {
    const chord = this.currentlyDisplayedChord;
    if (!chord) return;

    const voicings = this.generateChordVoicings(chord);
    const selectedVoicing = voicings[voicingIndex];

    if (selectedVoicing) {
      // Highlight the specific voicing on the main fretboard
      this.fretboard.highlightNotes(chord.notes);

      // Close modal
      this.hideChordVoicings();

      // Show a toast notification
      this.showToast(`Selected ${chord.symbol} - Position ${voicingIndex + 1}`);
    }
  }

  /**
   * Show a toast notification
   */
  showToast(message) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      toast.className = 'fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';

    setTimeout(() => {
      toast.style.opacity = '0';
    }, 2000);
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
  handleChordClick(chord, cardElement) {
    console.log('Chord clicked:', chord);

    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }

    // Clear any pending highlight reset
    if (this.highlightTimeout) {
      clearTimeout(this.highlightTimeout);
      this.highlightTimeout = null;
    }

    // Remove previous selection styling
    if (this.selectedChordCard) {
      this.selectedChordCard.classList.remove('border-blue-500', 'bg-blue-50', 'border-purple-500', 'bg-purple-50', 'selected');
      this.selectedChordCard.classList.add('border-gray-200');
    }

    // Add selection styling to current card
    if (cardElement) {
      cardElement.classList.remove('border-gray-200');
      const isPurple = cardElement.classList.contains('hover:border-purple-400');
      if (isPurple) {
        cardElement.classList.add('border-purple-500', 'bg-purple-50', 'selected');
      } else {
        cardElement.classList.add('border-blue-500', 'bg-blue-50', 'selected');
      }
      this.selectedChordCard = cardElement;
    }

    // Highlight chord tones on fretboard
    this.fretboard.highlightNotes(chord.notes);

    // Scroll fretboard into view on mobile
    if (window.innerWidth < 768) {
      const fretboardContainer = document.getElementById('fretboard-container');
      if (fretboardContainer) {
        fretboardContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    // Show chord voicing options overlay
    this.showChordVoicings(chord);
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

  // Initialize UX enhancements
  initializeUXEnhancements();
});

// Save preferences before page unload
window.addEventListener('beforeunload', () => {
  if (window.guitarScalesApp) {
    window.guitarScalesApp.savePreferences();
  }
});

/**
 * Initialize tab navigation
 */
function initializeTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));

      // Add active class to clicked button and corresponding content
      button.classList.add('active');
      const targetContent = document.querySelector(`[data-tab-content="${targetTab}"]`);
      if (targetContent) {
        targetContent.classList.add('active');
      }

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }

      // Save tab preference
      localStorage.setItem('activeTab', targetTab);
    });
  });

  // Restore last active tab
  const lastActiveTab = localStorage.getItem('activeTab');
  if (lastActiveTab) {
    const button = document.querySelector(`[data-tab="${lastActiveTab}"]`);
    if (button) {
      button.click();
    }
  }
}

/**
 * Initialize UX enhancements (mobile menu, zoom, keyboard shortcuts)
 */
function initializeUXEnhancements() {
  // Initialize tab navigation
  initializeTabNavigation();

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const controlPanel = document.getElementById('control-panel');

  if (mobileMenuBtn && controlPanel) {
    mobileMenuBtn.addEventListener('click', () => {
      controlPanel.classList.toggle('mobile-open');

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    });

    // Close menu when clicking outside
    controlPanel.addEventListener('click', (e) => {
      if (e.target === controlPanel) {
        controlPanel.classList.remove('mobile-open');
      }
    });
  }

  // Initialize swipe gestures for key changes
  initializeSwipeGestures();

  // Zoom controls
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const zoomResetBtn = document.getElementById('zoom-reset');

  if (zoomInBtn && zoomOutBtn && zoomResetBtn && window.guitarScalesApp) {
    const fretboard = window.guitarScalesApp.fretboard;

    zoomInBtn.addEventListener('click', () => {
      const newScale = Math.min(fretboard.currentScale + 0.2, 3);
      fretboard.setZoom(newScale);
      updateZoomDisplay(newScale);

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    });

    zoomOutBtn.addEventListener('click', () => {
      const newScale = Math.max(fretboard.currentScale - 0.2, 0.5);
      fretboard.setZoom(newScale);
      updateZoomDisplay(newScale);

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    });

    zoomResetBtn.addEventListener('click', () => {
      fretboard.setZoom(1);
      updateZoomDisplay(1);

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    });
  }

  // Keyboard shortcuts modal
  const shortcutsModal = document.getElementById('shortcuts-modal');
  const closeShortcuts = document.getElementById('close-shortcuts');

  if (closeShortcuts && shortcutsModal) {
    closeShortcuts.addEventListener('click', () => {
      shortcutsModal.classList.remove('show');
    });

    // Close on background click
    shortcutsModal.addEventListener('click', (e) => {
      if (e.target === shortcutsModal) {
        shortcutsModal.classList.remove('show');
      }
    });
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in input fields
    if (e.target.matches('input, select, textarea')) {
      return;
    }

    const app = window.guitarScalesApp;
    if (!app) return;

    switch(e.key) {
      case '?':
        // Show shortcuts modal
        if (shortcutsModal) {
          shortcutsModal.classList.add('show');
        }
        e.preventDefault();
        break;

      case 'Escape':
        // Close modals
        if (shortcutsModal) {
          shortcutsModal.classList.remove('show');
        }
        if (controlPanel) {
          controlPanel.classList.remove('mobile-open');
        }
        break;

      case 'm':
      case 'M':
        // Toggle mobile menu
        if (controlPanel) {
          controlPanel.classList.toggle('mobile-open');
        }
        e.preventDefault();
        break;

      case '+':
      case '=':
        // Zoom in
        if (app.fretboard) {
          const newScale = Math.min(app.fretboard.currentScale + 0.2, 3);
          app.fretboard.setZoom(newScale);
          updateZoomDisplay(newScale);
        }
        e.preventDefault();
        break;

      case '-':
      case '_':
        // Zoom out
        if (app.fretboard) {
          const newScale = Math.max(app.fretboard.currentScale - 0.2, 0.5);
          app.fretboard.setZoom(newScale);
          updateZoomDisplay(newScale);
        }
        e.preventDefault();
        break;

      case '0':
        // Reset zoom
        if (app.fretboard) {
          app.fretboard.setZoom(1);
          updateZoomDisplay(1);
        }
        e.preventDefault();
        break;

      case 'ArrowRight':
        // Next key
        cycleKey(1);
        e.preventDefault();
        break;

      case 'ArrowLeft':
        // Previous key
        cycleKey(-1);
        e.preventDefault();
        break;

      case 'd':
      case 'D':
        // Toggle display mode
        cycleDisplayMode();
        e.preventDefault();
        break;

      case 'c':
      case 'C':
        // Toggle chords
        const showChordsToggle = document.getElementById('show-chords');
        if (showChordsToggle) {
          showChordsToggle.checked = !showChordsToggle.checked;
          showChordsToggle.dispatchEvent(new Event('change'));
        }
        e.preventDefault();
        break;
    }
  });
}

/**
 * Update zoom display percentage
 */
function updateZoomDisplay(scale) {
  const zoomResetBtn = document.getElementById('zoom-reset');
  if (zoomResetBtn) {
    zoomResetBtn.textContent = `${Math.round(scale * 100)}%`;
  }
}

/**
 * Cycle through keys
 */
function cycleKey(direction) {
  const keySelector = document.getElementById('key-selector');
  if (!keySelector) return;

  const currentIndex = keySelector.selectedIndex;
  const newIndex = (currentIndex + direction + keySelector.options.length) % keySelector.options.length;

  keySelector.selectedIndex = newIndex;
  keySelector.dispatchEvent(new Event('change'));
}

/**
 * Cycle through display modes
 */
function cycleDisplayMode() {
  const displayModes = document.querySelectorAll('input[name="display-mode"]');
  if (!displayModes.length) return;

  let currentIndex = -1;
  displayModes.forEach((radio, index) => {
    if (radio.checked) {
      currentIndex = index;
    }
  });

  const nextIndex = (currentIndex + 1) % displayModes.length;
  displayModes[nextIndex].checked = true;
  displayModes[nextIndex].dispatchEvent(new Event('change'));
}

/**
 * Initialize swipe gestures for key changes
 */
function initializeSwipeGestures() {
  const fretboardContainer = document.getElementById('fretboard-container');
  if (!fretboardContainer) return;

  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  let isSwiping = false;
  let swipeDirection = null;

  const swipeIndicator = document.getElementById('swipe-indicator');
  const swipeKeyDisplay = document.getElementById('swipe-key-display');
  const swipeArrowLeft = document.getElementById('swipe-arrow-left');
  const swipeArrowRight = document.getElementById('swipe-arrow-right');

  const minSwipeDistance = 50; // Minimum distance for a swipe
  const swipeThreshold = 80; // Distance to show preview
  const swipeCommitThreshold = 120; // Distance to commit the change

  fretboardContainer.addEventListener('touchstart', (e) => {
    // Only track single finger swipes
    if (e.touches.length !== 1) return;

    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = false;
    swipeDirection = null;
  }, { passive: true });

  fretboardContainer.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;

    touchEndX = e.touches[0].clientX;
    touchEndY = e.touches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Determine if this is a horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      isSwiping = true;
      swipeDirection = deltaX > 0 ? 'right' : 'left';

      // Show preview when swipe distance exceeds threshold
      if (Math.abs(deltaX) > swipeThreshold && swipeIndicator && swipeKeyDisplay) {
        const keySelector = document.getElementById('key-selector');
        if (!keySelector) return;

        const currentIndex = keySelector.selectedIndex;
        const direction = swipeDirection === 'right' ? -1 : 1; // Right swipe = previous key
        const newIndex = (currentIndex + direction + keySelector.options.length) % keySelector.options.length;
        const newKey = keySelector.options[newIndex].value;

        // Update preview
        swipeKeyDisplay.textContent = newKey;
        swipeArrowLeft.classList.toggle('hidden', swipeDirection !== 'right');
        swipeArrowRight.classList.toggle('hidden', swipeDirection !== 'left');

        // Show indicator with scale based on swipe distance
        const opacity = Math.min((Math.abs(deltaX) - swipeThreshold) / (swipeCommitThreshold - swipeThreshold), 1);
        swipeIndicator.style.opacity = opacity;

        // Change background color when commit threshold is reached
        const indicatorBg = swipeIndicator.querySelector('div');
        if (Math.abs(deltaX) >= swipeCommitThreshold) {
          indicatorBg.classList.remove('bg-blue-500');
          indicatorBg.classList.add('bg-green-500');
        } else {
          indicatorBg.classList.remove('bg-green-500');
          indicatorBg.classList.add('bg-blue-500');
        }
      }
    }
  }, { passive: true });

  fretboardContainer.addEventListener('touchend', (e) => {
    if (!isSwiping) return;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Hide indicator
    if (swipeIndicator) {
      swipeIndicator.style.opacity = '0';
    }

    // Confirm it's a horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) >= swipeCommitThreshold) {
      const direction = deltaX > 0 ? -1 : 1; // Right swipe = previous key
      cycleKey(direction);

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(15);
      }

      // Show success animation
      if (swipeIndicator) {
        const keyScaleIndicator = document.getElementById('key-scale-indicator');
        if (keyScaleIndicator) {
          keyScaleIndicator.classList.add('scale-105');
          setTimeout(() => {
            keyScaleIndicator.classList.remove('scale-105');
          }, 200);
        }
      }
    }

    // Reset
    isSwiping = false;
    swipeDirection = null;
  }, { passive: true });

  // Update key/scale display when changed
  updateKeyScaleDisplay();
}

/**
 * Update the floating key/scale indicator
 */
function updateKeyScaleDisplay() {
  const keySelector = document.getElementById('key-selector');
  const scaleSelector = document.getElementById('scale-selector');
  const currentKeyDisplay = document.getElementById('current-key-display');
  const currentScaleDisplay = document.getElementById('current-scale-display');

  if (!keySelector || !scaleSelector) return;

  const updateDisplay = () => {
    if (currentKeyDisplay) {
      currentKeyDisplay.textContent = keySelector.value;
    }
    if (currentScaleDisplay) {
      const scaleText = scaleSelector.options[scaleSelector.selectedIndex].text;
      currentScaleDisplay.textContent = scaleText;
    }
  };

  // Initial update
  updateDisplay();

  // Listen for changes
  keySelector.addEventListener('change', updateDisplay);
  scaleSelector.addEventListener('change', updateDisplay);
}
