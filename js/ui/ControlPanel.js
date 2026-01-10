// UI Control Panel

import { NOTES } from '../data/constants.js';
import { getScalesByCategory, getAllScaleKeys } from '../data/scales.js';

export class ControlPanel {
  constructor(options = {}) {
    this.options = {
      onScaleChange: options.onScaleChange || null,
      onKeyChange: options.onKeyChange || null,
      onDisplayModeChange: options.onDisplayModeChange || null,
      onTuningChange: options.onTuningChange || null,
      ...options
    };

    this.currentKey = 'C';
    this.currentScale = 'major';
    this.currentDisplayMode = 'notes';

    this.init();
  }

  /**
   * Initialize control panel
   */
  init() {
    this.populateKeySelector();
    this.populateScaleSelector();
    this.setupEventListeners();
  }

  /**
   * Populate key selector dropdown
   */
  populateKeySelector() {
    const keySelector = document.getElementById('key-selector');
    if (!keySelector) return;

    keySelector.innerHTML = '';

    NOTES.forEach(note => {
      const option = document.createElement('option');
      option.value = note;
      option.textContent = note;
      if (note === this.currentKey) {
        option.selected = true;
      }
      keySelector.appendChild(option);
    });
  }

  /**
   * Populate scale selector dropdown
   */
  populateScaleSelector() {
    const scaleSelector = document.getElementById('scale-selector');
    if (!scaleSelector) return;

    scaleSelector.innerHTML = '';

    const scalesByCategory = getScalesByCategory();

    // Create optgroups for each category
    Object.entries(scalesByCategory).forEach(([category, scales]) => {
      if (scales.length === 0) return;

      const optgroup = document.createElement('optgroup');
      optgroup.label = category.charAt(0).toUpperCase() + category.slice(1);

      scales.forEach(scale => {
        const option = document.createElement('option');
        option.value = scale.key;
        option.textContent = scale.name;
        if (scale.key === this.currentScale) {
          option.selected = true;
        }
        optgroup.appendChild(option);
      });

      scaleSelector.appendChild(optgroup);
    });
  }

  /**
   * Setup event listeners for controls
   */
  setupEventListeners() {
    // Key selector
    const keySelector = document.getElementById('key-selector');
    if (keySelector) {
      keySelector.addEventListener('change', (e) => {
        this.currentKey = e.target.value;
        if (this.options.onKeyChange) {
          this.options.onKeyChange({
            key: this.currentKey,
            scale: this.currentScale
          });
        }
      });
    }

    // Scale selector
    const scaleSelector = document.getElementById('scale-selector');
    if (scaleSelector) {
      scaleSelector.addEventListener('change', (e) => {
        this.currentScale = e.target.value;
        if (this.options.onScaleChange) {
          this.options.onScaleChange({
            key: this.currentKey,
            scale: this.currentScale
          });
        }
      });
    }

    // Display mode radio buttons
    const displayModes = document.getElementsByName('display-mode');
    displayModes.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.currentDisplayMode = e.target.value;
        if (this.options.onDisplayModeChange) {
          this.options.onDisplayModeChange(this.currentDisplayMode);
        }
      });
    });

    // Tuning selector (if exists)
    const tuningSelector = document.getElementById('tuning-selector');
    if (tuningSelector) {
      tuningSelector.addEventListener('change', (e) => {
        if (this.options.onTuningChange) {
          this.options.onTuningChange(e.target.value);
        }
      });
    }

    // Show chords toggle (if exists)
    const showChordsToggle = document.getElementById('show-chords');
    if (showChordsToggle) {
      showChordsToggle.addEventListener('change', (e) => {
        if (this.options.onShowChordsChange) {
          this.options.onShowChordsChange(e.target.checked);
        }
      });
    }
  }

  /**
   * Update scale info panel
   */
  updateScaleInfo(scale) {
    const infoPanel = document.getElementById('scale-info');
    if (!infoPanel) return;

    const html = `
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="font-semibold text-gray-700">Scale:</span>
          <span class="text-gray-900">${scale.name}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="font-semibold text-gray-700">Root:</span>
          <span class="text-gray-900">${scale.root}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="font-semibold text-gray-700">Formula:</span>
          <span class="text-gray-900 font-mono text-sm">${scale.formula}</span>
        </div>
        <div class="mt-3">
          <span class="font-semibold text-gray-700">Notes:</span>
          <div class="flex flex-wrap gap-2 mt-2">
            ${scale.notes.map((note, i) => `
              <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                ${note} ${scale.degrees[i] ? `(${scale.degrees[i]})` : ''}
              </span>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    infoPanel.innerHTML = html;
  }

  /**
   * Update chord panel
   */
  updateChordPanel(chords) {
    const chordPanel = document.getElementById('chord-panel');
    if (!chordPanel) return;

    const html = chords.triads.map(chord => `
      <div class="chord-card bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-blue-400 cursor-pointer transition-colors">
        <div class="text-center">
          <div class="text-xl font-bold text-gray-900">${chord.symbol}</div>
          <div class="text-sm text-gray-500 mt-1">${chord.degree}</div>
          <div class="text-xs text-gray-400 mt-1">${chord.quality}</div>
        </div>
      </div>
    `).join('');

    chordPanel.innerHTML = html;

    // Add click handlers to chord cards
    const chordCards = chordPanel.querySelectorAll('.chord-card');
    chordCards.forEach((card, index) => {
      card.addEventListener('click', () => {
        if (this.options.onChordClick) {
          this.options.onChordClick(chords.triads[index], card);
        }
      });
    });
  }

  /**
   * Update seventh chords panel
   */
  updateSeventhChordsPanel(chords) {
    const seventhPanel = document.getElementById('seventh-chord-panel');
    if (!seventhPanel) return;

    if (!chords.sevenths || chords.sevenths.length === 0) {
      seventhPanel.innerHTML = '';
      return;
    }

    const html = chords.sevenths.map(chord => `
      <div class="chord-card bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-purple-400 cursor-pointer transition-colors">
        <div class="text-center">
          <div class="text-lg font-bold text-gray-900">${chord.symbol}</div>
          <div class="text-sm text-gray-500 mt-1">${chord.degree}</div>
        </div>
      </div>
    `).join('');

    seventhPanel.innerHTML = html;

    // Add click handlers
    const chordCards = seventhPanel.querySelectorAll('.chord-card');
    chordCards.forEach((card, index) => {
      card.addEventListener('click', () => {
        if (this.options.onChordClick) {
          this.options.onChordClick(chords.sevenths[index], card);
        }
      });
    });
  }

  /**
   * Show loading state
   */
  showLoading() {
    const fretboardContainer = document.getElementById('fretboard-container');
    if (fretboardContainer) {
      fretboardContainer.style.opacity = '0.5';
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    const fretboardContainer = document.getElementById('fretboard-container');
    if (fretboardContainer) {
      fretboardContainer.style.opacity = '1';
    }
  }

  /**
   * Get current selection
   */
  getCurrentSelection() {
    return {
      key: this.currentKey,
      scale: this.currentScale,
      displayMode: this.currentDisplayMode
    };
  }

  /**
   * Set current selection programmatically
   */
  setSelection(key, scale, displayMode = null) {
    if (key) {
      this.currentKey = key;
      const keySelector = document.getElementById('key-selector');
      if (keySelector) keySelector.value = key;
    }

    if (scale) {
      this.currentScale = scale;
      const scaleSelector = document.getElementById('scale-selector');
      if (scaleSelector) scaleSelector.value = scale;
    }

    if (displayMode) {
      this.currentDisplayMode = displayMode;
      const radio = document.querySelector(`input[name="display-mode"][value="${displayMode}"]`);
      if (radio) radio.checked = true;
    }
  }
}

export default ControlPanel;
