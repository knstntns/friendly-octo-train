// Main application entry point

import { ScaleEngine } from './core/ScaleEngine.js';
import { ChordEngine } from './core/ChordEngine.js';
import { FretboardRenderer } from './ui/FretboardRenderer.js';
import { ControlPanel } from './ui/ControlPanel.js';
import { TUNINGS } from './data/constants.js';
import { getChordVoicings } from './data/chordShapes.js';
import { getAudioEngine } from './core/AudioEngine.js';

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

    // Audio engine for chord playback
    this.audioEngine = getAudioEngine();
    this.isPlayingProgression = false;
    this.stopProgressionFn = null;
    this.playingChordIndex = -1;

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

    // Generate progression button
    const generateButton = document.getElementById('generate-progression');
    if (generateButton) {
      generateButton.addEventListener('click', () => {
        this.generateAutoProgression();
      });
    }

    // Analyze progression button
    const analyzeButton = document.getElementById('analyze-progression');
    if (analyzeButton) {
      analyzeButton.addEventListener('click', () => {
        this.analyzeCurrentProgression();
      });
    }
  }

  /**
   * Generate automatic progression
   */
  generateAutoProgression() {
    console.log('Generate progression called');

    if (!this.currentScale) {
      console.error('No current scale available');
      this.showToast('Please select a scale first');
      return;
    }

    // Get parameters from UI
    const length = parseInt(document.getElementById('progression-length')?.value || '8');
    const complexity = document.getElementById('progression-complexity')?.value || 'moderate';
    const style = document.getElementById('progression-style')?.value || 'pop';

    console.log('Generation parameters:', { length, complexity, style });

    try {
      // Generate progression
      const progression = this.chordEngine.generateProgression(
        this.currentScale,
        length,
        complexity,
        style
      );

      console.log('Generated progression:', progression);

      // Update current progression
      this.currentProgression = progression;
      this.updateCurrentProgressionDisplay();

      // Show toast notification
      this.showToast(`Generated ${length}-chord ${complexity} ${style} progression`);

      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 50, 10]);
      }
    } catch (error) {
      console.error('Error generating progression:', error);
      this.showToast('Error generating progression: ' + error.message);
    }
  }

  /**
   * Analyze current progression
   */
  analyzeCurrentProgression() {
    if (!this.currentProgression || this.currentProgression.length === 0) {
      this.showToast('No progression to analyze');
      return;
    }

    const analysis = this.chordEngine.analyzeProgression(
      this.currentProgression,
      this.currentScale
    );

    // Create analysis modal
    this.showAnalysisModal(analysis);
  }

  /**
   * Show analysis modal with progression insights
   */
  showAnalysisModal(analysis) {
    // Create or get modal
    let modal = document.getElementById('analysis-modal');
    if (!modal) {
      modal = this.createAnalysisModal();
    }

    // Build analysis content
    const content = `
      <div class="mb-6">
        <h3 class="text-2xl font-bold text-gray-900 mb-2">Progression Analysis</h3>
        <div class="flex items-center gap-4 text-sm text-gray-600">
          <span>Key: <strong>${analysis.keyCenter}</strong></span>
          <span>Length: <strong>${analysis.length} chords</strong></span>
          <span>Complexity: <strong class="capitalize">${analysis.complexity}</strong></span>
        </div>
      </div>

      <!-- Features -->
      ${analysis.features.length > 0 ? `
        <div class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 class="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">Key Features</h4>
          <ul class="space-y-1">
            ${analysis.features.map(feature => `
              <li class="text-sm text-gray-700 flex items-start">
                <svg class="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                ${feature}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}

      <!-- Chord-by-Chord Analysis -->
      <div class="mb-4">
        <h4 class="text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Chord-by-Chord Analysis</h4>
        <div class="space-y-2">
          ${analysis.chords.map((chord, index) => `
            <div class="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-gray-500">${chord.position}.</span>
                  <span class="text-lg font-bold text-gray-900">${chord.symbol}</span>
                  <span class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">${chord.degree}</span>
                  <span class="text-xs px-2 py-1 ${this.getLayerBadgeColor(chord.layer)} rounded capitalize">${this.getLayerName(chord.layer)}</span>
                </div>
                <span class="text-xs text-gray-600">${chord.function}</span>
              </div>
              ${chord.transition ? `
                <div class="text-xs text-gray-500 mt-1">
                  <span class="font-medium">Voice leading:</span> ${chord.transition.quality}
                  (${chord.transition.commonTones} common tone${chord.transition.commonTones !== 1 ? 's' : ''})
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 mt-6">
        <button onclick="window.guitarScalesApp.saveProgression()" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium">
          Save as Preset
        </button>
        <button onclick="window.guitarScalesApp.exportProgression()" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium">
          Export
        </button>
      </div>
    `;

    const container = modal.querySelector('#analysis-content');
    container.innerHTML = content;

    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  /**
   * Create analysis modal
   */
  createAnalysisModal() {
    const modal = document.createElement('div');
    modal.id = 'analysis-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 hidden items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative animate-modal-in">
        <button id="close-analysis-modal" class="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <div id="analysis-content">
          <!-- Content will be populated dynamically -->
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideAnalysisModal();
      }
    });

    // Close button handler
    modal.querySelector('#close-analysis-modal').addEventListener('click', () => {
      this.hideAnalysisModal();
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        this.hideAnalysisModal();
      }
    });

    return modal;
  }

  /**
   * Hide analysis modal
   */
  hideAnalysisModal() {
    const modal = document.getElementById('analysis-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  /**
   * Get color class for layer badge
   */
  getLayerBadgeColor(layer) {
    const colors = {
      main: 'bg-blue-100 text-blue-800',
      secondary: 'bg-orange-100 text-orange-800',
      modal: 'bg-purple-100 text-purple-800',
      neapolitan: 'bg-green-100 text-green-800',
      'secondary-dim': 'bg-red-100 text-red-800'
    };
    return colors[layer] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Get display name for layer
   */
  getLayerName(layer) {
    const names = {
      main: 'Diatonic',
      secondary: 'Secondary Dom',
      modal: 'Modal Int.',
      neapolitan: 'Neapolitan',
      'secondary-dim': 'Secondary Dim'
    };
    return names[layer] || layer;
  }

  /**
   * Save progression as preset (placeholder)
   */
  saveProgression() {
    // TODO: Implement saving to localStorage or database
    this.showToast('Progression saved!');
    this.hideAnalysisModal();
  }

  /**
   * Export progression (placeholder)
   */
  exportProgression() {
    // Create exportable format
    const exportData = {
      key: this.currentScale.root,
      scale: this.currentScale.name,
      progression: this.currentProgression.map(chord => ({
        symbol: chord.symbol,
        degree: chord.degree,
        layer: chord.layer
      }))
    };

    // Copy to clipboard
    const json = JSON.stringify(exportData, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      this.showToast('Progression copied to clipboard!');
    }).catch(() => {
      this.showToast('Export format: ' + json);
    });

    this.hideAnalysisModal();
  }

  /**
   * Update progression builder with all layers
   */
  updateProgressionBuilder() {
    if (!this.currentScale) return;

    // Get all layers
    this.progressionLayers = this.chordEngine.getProgressionLayers(this.currentScale);

    // Update each layer
    this.updateSecondaryDominantsPanel();
    this.updateMainChordsPanel();
    this.updateModalInterchangePanel();
    this.updateNeapolitanPanel();
    this.updateSecondaryDiminishedPanel();
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
   * Update Neapolitan chords panel
   */
  updateNeapolitanPanel() {
    const panel = document.getElementById('neapolitan-panel');
    if (!panel || !this.progressionLayers) return;

    const html = this.progressionLayers.neapolitan.map((chord, index) => `
      <div class="progression-chord-card bg-white border-2 border-green-300 rounded-lg p-2 hover:border-green-500 hover:shadow-md cursor-pointer transition-all" data-layer="neapolitan" data-index="${index}">
        <div class="text-center">
          <div class="text-base font-bold text-gray-900">${chord.symbol}</div>
          <div class="text-xs text-green-600 mt-1">${chord.degree}</div>
          <div class="text-xs text-gray-400 mt-1">${chord.root}</div>
        </div>
      </div>
    `).join('');

    panel.innerHTML = html;

    // Add click handlers
    panel.querySelectorAll('.progression-chord-card').forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.dataset.index);
        this.handleProgressionChordClick(this.progressionLayers.neapolitan[index], 'neapolitan');
      });
    });
  }

  /**
   * Update secondary diminished chords panel
   */
  updateSecondaryDiminishedPanel() {
    const panel = document.getElementById('secondary-diminished-panel');
    if (!panel || !this.progressionLayers) return;

    const html = this.progressionLayers.secondaryDiminished.map((chord, index) => `
      <div class="progression-chord-card bg-white border-2 border-red-300 rounded-lg p-2 hover:border-red-500 hover:shadow-md cursor-pointer transition-all" data-layer="secondary-dim" data-index="${index}">
        <div class="text-center">
          <div class="text-base font-bold text-gray-900">${chord.symbol}</div>
          <div class="text-xs text-red-600 mt-1">${chord.degree}</div>
          <div class="text-xs text-gray-400 mt-1">${chord.root}</div>
        </div>
      </div>
    `).join('');

    panel.innerHTML = html;

    // Add click handlers
    panel.querySelectorAll('.progression-chord-card').forEach(card => {
      card.addEventListener('click', () => {
        const index = parseInt(card.dataset.index);
        this.handleProgressionChordClick(this.progressionLayers.secondaryDiminished[index], 'secondary-dim');
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
      this.updatePlayAllButton();
      return;
    }

    const layerColors = {
      secondary: 'bg-orange-100 text-orange-800 border-orange-300',
      main: 'bg-blue-100 text-blue-800 border-blue-300',
      modal: 'bg-purple-100 text-purple-800 border-purple-300',
      neapolitan: 'bg-green-100 text-green-800 border-green-300',
      'secondary-dim': 'bg-red-100 text-red-800 border-red-300'
    };

    const html = this.currentProgression.map((chord, index) => `
      <div class="flex items-center gap-1 progression-chord-item" data-chord-index="${index}">
        <div class="relative group">
          <span class="chord-badge px-3 py-1 ${layerColors[chord.layer]} border rounded-lg text-sm font-medium hover:shadow-md transition-all cursor-pointer ${this.playingChordIndex === index ? 'ring-2 ring-indigo-500 scale-110' : ''}" data-index="${index}">
            ${chord.symbol}
            <span class="text-xs opacity-70 ml-1">${chord.degree}</span>
          </span>
        </div>
        ${index < this.currentProgression.length - 1 ? '<span class="text-gray-400 mx-1">→</span>' : ''}
      </div>
    `).join('');

    display.innerHTML = html;

    // Add click handlers - single click to play, double click to remove
    display.querySelectorAll('.chord-badge').forEach(element => {
      // Single click to play chord
      element.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(element.dataset.index);
        this.playSingleChord(index);
      });

      // Double click to remove chord
      element.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const index = parseInt(element.dataset.index);
        this.currentProgression.splice(index, 1);
        this.updateCurrentProgressionDisplay();
      });
    });

    this.updatePlayAllButton();
  }

  /**
   * Play a single chord from the progression
   */
  playSingleChord(index) {
    const chord = this.currentProgression[index];
    if (!chord || !chord.notes) return;

    // Visual feedback
    this.highlightPlayingChord(index);

    // Play the chord
    this.audioEngine.playChord(chord.notes, {
      arpeggio: false,
      duration: 1.5,
      baseOctave: 3
    });

    // Highlight chord notes on fretboard
    if (chord.notes) {
      this.fretboard.highlightNotes(chord.notes);
    }

    // Clear highlight after chord plays
    setTimeout(() => {
      if (this.playingChordIndex === index) {
        this.playingChordIndex = -1;
        this.updateChordHighlight();
        this.fretboard.resetHighlights();
      }
    }, 1500);
  }

  /**
   * Highlight the currently playing chord
   */
  highlightPlayingChord(index) {
    this.playingChordIndex = index;
    this.updateChordHighlight();
  }

  /**
   * Update chord highlight visuals
   */
  updateChordHighlight() {
    const display = document.getElementById('current-progression');
    if (!display) return;

    display.querySelectorAll('.chord-badge').forEach((badge, i) => {
      if (i === this.playingChordIndex) {
        badge.classList.add('ring-2', 'ring-indigo-500', 'scale-110');
      } else {
        badge.classList.remove('ring-2', 'ring-indigo-500', 'scale-110');
      }
    });
  }

  /**
   * Update the Play All button state
   */
  updatePlayAllButton() {
    let playAllBtn = document.getElementById('play-progression-btn');

    // Create button if it doesn't exist
    if (!playAllBtn) {
      const clearBtn = document.getElementById('clear-progression');
      if (clearBtn && clearBtn.parentElement) {
        playAllBtn = document.createElement('button');
        playAllBtn.id = 'play-progression-btn';
        playAllBtn.className = 'bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-1.5 px-3 rounded-lg transition-colors shadow flex items-center gap-1';
        playAllBtn.innerHTML = '<span>▶</span><span>Play</span>';
        playAllBtn.addEventListener('click', () => this.playEntireProgression());
        clearBtn.parentElement.insertBefore(playAllBtn, clearBtn);
      }
    }

    if (playAllBtn) {
      if (this.currentProgression.length === 0) {
        playAllBtn.disabled = true;
        playAllBtn.classList.add('opacity-50', 'cursor-not-allowed');
      } else {
        playAllBtn.disabled = false;
        playAllBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }

      // Update button state based on playing status
      if (this.isPlayingProgression) {
        playAllBtn.innerHTML = '<span>⏹</span><span>Stop</span>';
        playAllBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        playAllBtn.classList.add('bg-red-500', 'hover:bg-red-600');
      } else {
        playAllBtn.innerHTML = '<span>▶</span><span>Play</span>';
        playAllBtn.classList.remove('bg-red-500', 'hover:bg-red-600');
        playAllBtn.classList.add('bg-green-500', 'hover:bg-green-600');
      }
    }
  }

  /**
   * Play the entire chord progression
   */
  playEntireProgression() {
    if (this.isPlayingProgression) {
      this.stopProgression();
      return;
    }

    if (this.currentProgression.length === 0) return;

    this.isPlayingProgression = true;
    this.updatePlayAllButton();

    const tempo = 90; // BPM

    this.stopProgressionFn = this.audioEngine.playProgression(this.currentProgression, {
      tempo,
      beatsPerChord: 2,
      arpeggio: false,
      onChordStart: (index, chord) => {
        this.highlightPlayingChord(index);
        if (chord.notes) {
          this.fretboard.highlightNotes(chord.notes);
        }
      },
      onComplete: () => {
        this.isPlayingProgression = false;
        this.playingChordIndex = -1;
        this.updateChordHighlight();
        this.updatePlayAllButton();
        this.fretboard.resetHighlights();
      }
    });
  }

  /**
   * Stop the currently playing progression
   */
  stopProgression() {
    if (this.stopProgressionFn) {
      this.stopProgressionFn();
      this.stopProgressionFn = null;
    }
    this.isPlayingProgression = false;
    this.playingChordIndex = -1;
    this.updateChordHighlight();
    this.updatePlayAllButton();
    this.fretboard.resetHighlights();
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
   * Generate chord voicings for display using real guitar chord shapes
   */
  generateChordVoicings(chord) {
    // Use the chord shapes library for accurate voicings
    const voicings = getChordVoicings(chord.root, chord.quality, 4);

    // If no voicings found, fall back to basic chord shape generation
    if (voicings.length === 0) {
      return this.generateFallbackVoicings(chord);
    }

    return voicings;
  }

  /**
   * Fallback chord voicing generation for chords not in library
   */
  generateFallbackVoicings(chord) {
    const voicings = [];
    const tuning = ['E', 'A', 'D', 'G', 'B', 'E'];
    const positions = [0, 3, 5, 7]; // Common positions

    positions.forEach(startFret => {
      const shape = this.generateBasicShape(chord, startFret, tuning);
      if (shape && shape.frets.some(f => f >= 0)) {
        voicings.push(shape);
      }
    });

    return voicings.slice(0, 4);
  }

  /**
   * Generate a basic chord shape algorithmically
   */
  generateBasicShape(chord, rootFret, tuning) {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const chordNoteIndices = chord.notes.map(n => notes.indexOf(n));

    const shape = {
      name: rootFret === 0 ? `${chord.symbol} Open` : `${chord.symbol} (${rootFret}fr)`,
      baseFret: rootFret,
      frets: [],
      fingers: []
    };

    // For each string, find if it contains a chord tone within reach
    tuning.forEach((openString, stringIndex) => {
      const openNoteIndex = notes.indexOf(openString);
      let found = false;

      // Check frets within a 4-fret span from rootFret
      for (let fret = rootFret; fret <= rootFret + 4 && fret <= 15; fret++) {
        const noteIndex = (openNoteIndex + fret) % 12;
        if (chordNoteIndices.includes(noteIndex)) {
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

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        ${voicings.map((voicing, index) => this.renderChordDiagram(voicing, index)).join('')}
      </div>

      <div class="text-center">
        <div class="inline-flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>Click a diagram to apply to fretboard | Press ESC to close</span>
        </div>
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
      <div class="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative animate-modal-in">
        <button id="close-voicings-modal" class="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
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
   * Render an enhanced chord diagram
   */
  renderChordDiagram(voicing, index) {
    const strings = 6;
    const frets = 5;

    // Determine display fret number
    const baseFret = voicing.baseFret || 0;
    const displayStartFret = baseFret > 0 ? baseFret : 1;

    // Adjust frets for display
    const adjustedFrets = voicing.frets.map(f => {
      if (f < 0) return -1; // Muted
      if (f === 0) return 0; // Open
      return f - baseFret + 1;
    });

    // Get shape name if available
    const shapeName = voicing.name || `Position ${index + 1}`;
    const isCAGED = shapeName.includes('shape');
    const isOpenPosition = baseFret === 0 || displayStartFret === 1;

    return `
      <div class="border-2 border-gray-300 rounded-lg p-4 bg-gradient-to-b from-gray-50 to-white hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer" onclick="window.guitarScalesApp.selectVoicing(${index})">
        <div class="text-center mb-3">
          <div class="text-sm font-bold text-gray-800">${shapeName}</div>
          ${isCAGED && isOpenPosition ? `<div class="text-xs text-green-600 font-semibold mt-1">Open Position</div>` : ''}
          ${displayStartFret > 1 ? `<div class="text-xs text-gray-500 mt-1">Starts at fret ${displayStartFret}</div>` : ''}
        </div>

        <div class="chord-diagram mx-auto relative" style="width: 140px;">
          <svg viewBox="0 0 110 145" class="w-full h-auto">
            <!-- Nut (thicker line at top for open position) -->
            ${displayStartFret === 1 ? '<rect x="10" y="10" width="90" height="4" fill="#222" rx="1" />' : ''}

            <!-- Fret position marker (for higher positions) -->
            ${displayStartFret > 1 ? `<text x="2" y="32" font-size="11" fill="#666" font-weight="bold">${displayStartFret}</text>` : ''}

            <!-- Frets -->
            ${Array.from({length: frets}, (_, i) => `
              <line x1="10" y1="${20 + i * 22}" x2="100" y2="${20 + i * 22}"
                    stroke="#888" stroke-width="1.5" />
            `).join('')}

            <!-- Strings (reversed for left-to-right: low E to high E) -->
            ${Array.from({length: strings}, (_, i) => `
              <line x1="${15 + i * 17}" y1="10" x2="${15 + i * 17}" y2="108"
                    stroke="#555" stroke-width="${i === 0 || i === strings - 1 ? '2.5' : '2'}"
                    opacity="0.8" />
            `).join('')}

            <!-- Finger positions & numbers -->
            ${adjustedFrets.map((fret, stringIndex) => {
              const x = 15 + stringIndex * 17;

              if (fret < 0) {
                // Muted string (X)
                return `<text x="${x}" y="8" font-size="12" fill="#dc2626" text-anchor="middle" font-weight="bold">×</text>`;
              } else if (fret === 0) {
                // Open string (O)
                return `<circle cx="${x}" cy="4" r="5" fill="none" stroke="#059669" stroke-width="2.5" />`;
              } else {
                // Fretted note
                const y = 9 + (fret * 22);

                // Determine if this is a root note
                const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
                const tuning = ['E', 'A', 'D', 'G', 'B', 'E'];
                const stringNote = (notes.indexOf(tuning[stringIndex]) + voicing.frets[stringIndex]) % 12;
                const rootNote = voicing.frets.find(f => f >= 0);
                const rootNoteIndex = rootNote >= 0 ? (notes.indexOf(tuning[voicing.frets.indexOf(rootNote)]) + rootNote) % 12 : -1;
                const isRoot = stringNote === rootNoteIndex;

                // Get finger number if available
                const fingerNum = voicing.fingers && voicing.fingers[stringIndex] > 0 ? voicing.fingers[stringIndex] : '';

                return `
                  <circle cx="${x}" cy="${y}" r="7"
                          fill="${isRoot ? '#2563EB' : '#475569'}"
                          stroke="#fff" stroke-width="2" />
                  ${fingerNum ? `<text x="${x}" y="${y + 4}" font-size="9" fill="#fff" text-anchor="middle" font-weight="bold">${fingerNum}</text>` : ''}
                `;
              }
            }).join('')}
          </svg>

          <!-- String labels -->
          <div class="flex justify-between text-xs text-gray-600 mt-2 px-1 font-medium">
            <span class="opacity-70">E</span>
            <span class="opacity-70">A</span>
            <span class="opacity-70">D</span>
            <span class="opacity-70">G</span>
            <span class="opacity-70">B</span>
            <span class="opacity-70">e</span>
          </div>
        </div>

        <!-- Legend -->
        <div class="mt-3 flex items-center justify-center gap-3 text-xs">
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 rounded-full bg-blue-600"></div>
            <span class="text-gray-600">Root</span>
          </div>
          ${voicing.fingers && voicing.fingers.some(f => f > 0) ? `
            <div class="flex items-center gap-1">
              <div class="w-3 h-3 rounded-full bg-gray-600 text-white text-xs flex items-center justify-center" style="font-size: 8px;">1</div>
              <span class="text-gray-600">Finger</span>
            </div>
          ` : ''}
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
    // Clear current progression when key changes since chords are now in a different key
    this.currentProgression = [];
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
      const progressionsSection = document.getElementById('progression-builder-section');

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
