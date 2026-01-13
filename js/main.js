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

    // Reset highlights after 4 seconds (longer on mobile for better UX)
    const timeout = window.innerWidth < 768 ? 4000 : 3000;
    this.highlightTimeout = setTimeout(() => {
      this.fretboard.resetHighlights();

      // Remove selection styling
      if (this.selectedChordCard) {
        this.selectedChordCard.classList.remove('border-blue-500', 'bg-blue-50', 'border-purple-500', 'bg-purple-50', 'selected');
        this.selectedChordCard.classList.add('border-gray-200');
        this.selectedChordCard = null;
      }

      this.highlightTimeout = null;
    }, timeout);
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
 * Initialize UX enhancements (mobile menu, zoom, keyboard shortcuts)
 */
function initializeUXEnhancements() {
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
