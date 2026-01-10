// SVG Fretboard Renderer

import { FRET_MARKERS, DOUBLE_MARKERS, TUNINGS } from '../data/constants.js';

export class FretboardRenderer {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with ID '${containerId}' not found`);
      return;
    }

    this.options = {
      numFrets: options.numFrets || 24,
      numStrings: options.numStrings || 6,
      fretWidth: options.fretWidth || 60,
      stringSpacing: options.stringSpacing || 50,
      nutWidth: options.nutWidth || 10,
      displayMode: options.displayMode || 'notes', // 'notes', 'degrees', 'intervals'
      tuning: options.tuning || TUNINGS.standard,
      showFretNumbers: options.showFretNumbers !== false,
      ...options
    };

    this.svg = null;
    this.currentPositions = [];
    this.noteElements = new Map();

    this.init();
  }

  /**
   * Initialize the fretboard SVG
   */
  init() {
    this.createSVG();
    this.render();
  }

  /**
   * Create the main SVG element
   */
  createSVG() {
    const width = this.options.nutWidth + (this.options.numFrets * this.options.fretWidth);
    const height = (this.options.numStrings - 1) * this.options.stringSpacing + 100;

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('id', 'fretboard-svg');
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg.setAttribute('class', 'fretboard');

    this.container.innerHTML = '';
    this.container.appendChild(this.svg);
  }

  /**
   * Render the complete fretboard
   */
  render() {
    if (!this.svg) return;

    this.svg.innerHTML = '';

    // Draw background
    this.drawBackground();

    // Draw frets
    this.drawFrets();

    // Draw strings
    this.drawStrings();

    // Draw fret markers
    this.drawFretMarkers();

    // Draw fret numbers
    if (this.options.showFretNumbers) {
      this.drawFretNumbers();
    }

    // Create notes group (will be populated later)
    const notesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    notesGroup.setAttribute('id', 'notes-group');
    this.svg.appendChild(notesGroup);

    // Draw tuning labels
    this.drawTuningLabels();
  }

  /**
   * Draw fretboard background
   */
  drawBackground() {
    const width = this.options.nutWidth + (this.options.numFrets * this.options.fretWidth);
    const height = (this.options.numStrings - 1) * this.options.stringSpacing;
    const margin = 40;

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', 0);
    bg.setAttribute('y', margin);
    bg.setAttribute('width', width);
    bg.setAttribute('height', height);
    bg.setAttribute('class', 'fretboard-background');
    bg.setAttribute('fill', '#8B4513');
    bg.setAttribute('rx', '5');

    this.svg.appendChild(bg);
  }

  /**
   * Draw frets (vertical lines)
   */
  drawFrets() {
    const margin = 40;
    const stringHeight = (this.options.numStrings - 1) * this.options.stringSpacing;

    // Draw nut (fret 0)
    const nut = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    nut.setAttribute('x', 0);
    nut.setAttribute('y', margin);
    nut.setAttribute('width', this.options.nutWidth);
    nut.setAttribute('height', stringHeight);
    nut.setAttribute('fill', '#2C2416');
    this.svg.appendChild(nut);

    // Draw frets
    for (let fret = 1; fret <= this.options.numFrets; fret++) {
      const x = this.options.nutWidth + (fret * this.options.fretWidth);

      const fretLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      fretLine.setAttribute('x1', x);
      fretLine.setAttribute('y1', margin);
      fretLine.setAttribute('x2', x);
      fretLine.setAttribute('y2', margin + stringHeight);
      fretLine.setAttribute('class', 'fret');
      fretLine.setAttribute('stroke', '#C0C0C0');
      fretLine.setAttribute('stroke-width', fret === 12 ? '3' : '2');

      this.svg.appendChild(fretLine);
    }
  }

  /**
   * Draw strings (horizontal lines)
   */
  drawStrings() {
    const width = this.options.nutWidth + (this.options.numFrets * this.options.fretWidth);
    const margin = 40;

    for (let string = 0; string < this.options.numStrings; string++) {
      const y = margin + (string * this.options.stringSpacing);
      const stringWidth = 0.5 + (this.options.numStrings - string) * 0.3;

      const stringLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      stringLine.setAttribute('x1', 0);
      stringLine.setAttribute('y1', y);
      stringLine.setAttribute('x2', width);
      stringLine.setAttribute('y2', y);
      stringLine.setAttribute('class', `string string-${string + 1}`);
      stringLine.setAttribute('stroke', '#D4D4D4');
      stringLine.setAttribute('stroke-width', stringWidth);

      this.svg.appendChild(stringLine);
    }
  }

  /**
   * Draw fret marker dots
   */
  drawFretMarkers() {
    const margin = 40;
    const stringHeight = (this.options.numStrings - 1) * this.options.stringSpacing;
    const centerY = margin + stringHeight / 2;

    FRET_MARKERS.forEach(fret => {
      if (fret > this.options.numFrets) return;

      const x = this.options.nutWidth + (fret * this.options.fretWidth) - (this.options.fretWidth / 2);

      if (DOUBLE_MARKERS.includes(fret)) {
        // Draw two dots for 12th and 24th fret
        const dot1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot1.setAttribute('cx', x);
        dot1.setAttribute('cy', centerY - 25);
        dot1.setAttribute('r', '6');
        dot1.setAttribute('class', 'fret-marker');
        dot1.setAttribute('fill', '#A0826D');

        const dot2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot2.setAttribute('cx', x);
        dot2.setAttribute('cy', centerY + 25);
        dot2.setAttribute('r', '6');
        dot2.setAttribute('class', 'fret-marker');
        dot2.setAttribute('fill', '#A0826D');

        this.svg.appendChild(dot1);
        this.svg.appendChild(dot2);
      } else {
        // Single dot
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', centerY);
        dot.setAttribute('r', '6');
        dot.setAttribute('class', 'fret-marker');
        dot.setAttribute('fill', '#A0826D');

        this.svg.appendChild(dot);
      }
    });
  }

  /**
   * Draw fret numbers
   */
  drawFretNumbers() {
    const margin = 40;
    const stringHeight = (this.options.numStrings - 1) * this.options.stringSpacing;
    const y = margin + stringHeight + 20;

    for (let fret = 0; fret <= this.options.numFrets; fret += 3) {
      if (fret === 0) continue;

      const x = this.options.nutWidth + (fret * this.options.fretWidth) - (this.options.fretWidth / 2);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y);
      text.setAttribute('class', 'fret-number');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#666');
      text.setAttribute('font-size', '12');
      text.textContent = fret;

      this.svg.appendChild(text);
    }
  }

  /**
   * Draw tuning labels
   */
  drawTuningLabels() {
    const margin = 40;
    const x = -15;

    this.options.tuning.forEach((note, index) => {
      const y = margin + (index * this.options.stringSpacing);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y + 5);
      text.setAttribute('class', 'tuning-label');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#333');
      text.setAttribute('font-size', '14');
      text.setAttribute('font-weight', 'bold');
      text.textContent = note;

      this.svg.appendChild(text);
    });
  }

  /**
   * Update note positions on fretboard
   */
  updateNotes(positions, displayMode = null) {
    this.currentPositions = positions;

    if (displayMode) {
      this.options.displayMode = displayMode;
    }

    const notesGroup = this.svg.querySelector('#notes-group');
    if (!notesGroup) return;

    notesGroup.innerHTML = '';
    this.noteElements.clear();

    positions.forEach(pos => {
      const noteGroup = this.createNoteElement(pos);
      notesGroup.appendChild(noteGroup);
      this.noteElements.set(`${pos.string}-${pos.fret}`, noteGroup);
    });
  }

  /**
   * Create a note element (circle with label)
   */
  createNoteElement(position) {
    const { string, fret, note, degree, interval, isRoot } = position;

    const margin = 40;
    const x = fret === 0
      ? this.options.nutWidth / 2
      : this.options.nutWidth + (fret * this.options.fretWidth) - (this.options.fretWidth / 2);
    const y = margin + ((string - 1) * this.options.stringSpacing);

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', `note-group ${isRoot ? 'root-note' : 'scale-note'}`);
    group.setAttribute('data-string', string);
    group.setAttribute('data-fret', fret);
    group.setAttribute('data-note', note);

    // Circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '16');
    circle.setAttribute('class', isRoot ? 'note-circle-root' : 'note-circle');
    circle.setAttribute('fill', isRoot ? '#FF6B6B' : '#4ECDC4');
    circle.setAttribute('stroke', '#fff');
    circle.setAttribute('stroke-width', '2');

    // Label
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y + 5);
    text.setAttribute('class', 'note-label');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#fff');
    text.setAttribute('font-size', '12');
    text.setAttribute('font-weight', 'bold');

    // Set label based on display mode
    let label = note;
    if (this.options.displayMode === 'degrees') {
      label = degree || note;
    } else if (this.options.displayMode === 'intervals' && interval !== undefined) {
      const intervalNames = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7'];
      label = intervalNames[interval] || note;
    }

    text.textContent = label;

    group.appendChild(circle);
    group.appendChild(text);

    // Add click event
    group.style.cursor = 'pointer';
    group.addEventListener('click', () => this.onNoteClick(position));
    group.addEventListener('mouseenter', () => this.onNoteHover(position, group));
    group.addEventListener('mouseleave', () => this.onNoteLeave(position, group));

    return group;
  }

  /**
   * Handle note click event
   */
  onNoteClick(position) {
    if (this.options.onNoteClick) {
      this.options.onNoteClick(position);
    }
  }

  /**
   * Handle note hover event
   */
  onNoteHover(position, element) {
    element.style.opacity = '0.8';
    element.style.transform = 'scale(1.1)';
    element.style.transformOrigin = 'center';

    if (this.options.onNoteHover) {
      this.options.onNoteHover(position);
    }
  }

  /**
   * Handle note leave event
   */
  onNoteLeave(position, element) {
    element.style.opacity = '1';
    element.style.transform = 'scale(1)';

    if (this.options.onNoteLeave) {
      this.options.onNoteLeave(position);
    }
  }

  /**
   * Clear all notes from fretboard
   */
  clearNotes() {
    const notesGroup = this.svg.querySelector('#notes-group');
    if (notesGroup) {
      notesGroup.innerHTML = '';
    }
    this.noteElements.clear();
    this.currentPositions = [];
  }

  /**
   * Set display mode
   */
  setDisplayMode(mode) {
    this.options.displayMode = mode;
    this.updateNotes(this.currentPositions);
  }

  /**
   * Change tuning
   */
  setTuning(tuning) {
    this.options.tuning = tuning;
    this.render();
  }

  /**
   * Highlight specific notes
   */
  highlightNotes(noteNames) {
    this.noteElements.forEach((element, key) => {
      const noteData = element.getAttribute('data-note');
      const circle = element.querySelector('circle');

      if (noteNames.includes(noteData)) {
        circle.setAttribute('fill', '#FFD93D');
        circle.setAttribute('stroke', '#FF6B6B');
        circle.setAttribute('stroke-width', '3');
      }
    });
  }

  /**
   * Reset all note highlights
   */
  resetHighlights() {
    this.updateNotes(this.currentPositions);
  }

  /**
   * Get current positions
   */
  getPositions() {
    return this.currentPositions;
  }
}

export default FretboardRenderer;
