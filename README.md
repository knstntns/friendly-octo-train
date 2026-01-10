# Guitar Scales Explorer 🎸

An interactive web application for learning and exploring guitar scales, modes, and chord theory. Built with vanilla JavaScript and designed to be hosted on GitHub Pages.

![Guitar Scales Explorer](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### 🎵 Comprehensive Scale Library
- **Major & Minor Scales**: Major, Natural Minor, Harmonic Minor, Melodic Minor
- **Pentatonic Scales**: Major and Minor Pentatonic
- **All 7 Modes**: Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian
- **Exotic Scales**: 20+ scales including Blues, Harmonic Major, Hungarian Minor, Whole Tone, Diminished, and many more

### 🎨 Interactive Fretboard
- Beautiful SVG-rendered guitar fretboard with 15 frets (expandable to 24)
- Visual distinction between root notes and scale degrees
- Clickable notes with hover effects
- Smooth animations and transitions
- Mobile-responsive design with horizontal scrolling

### 🔄 Display Modes
- **Note Names**: See the actual note names (C, D, E, etc.)
- **Scale Degrees**: View scale degrees (1, 2, 3, b3, #4, etc.)
- **Intervals**: Display intervals from root (P1, M2, M3, P5, etc.)

### 🎹 Chord Harmonization
- Automatic harmonization of triads from any scale
- Extended 7th chord voicings
- Chord quality indicators (major, minor, diminished, augmented)
- Roman numeral analysis
- Common chord progressions (I-IV-V, ii-V-I, etc.)
- Click chords to highlight their notes on the fretboard

### 🎼 Music Theory Integration
- Scale formulas (W-W-H-W-W-W-H patterns)
- Interval calculations
- Enharmonic note handling
- Multiple guitar tunings support (standard, drop D, etc.)

### 💾 User Preferences
- LocalStorage saves your last selected scale and key
- Display mode preferences persist across sessions

## 🚀 Demo

Visit the live demo: [Guitar Scales Explorer](https://yourusername.github.io/friendly-octo-train)

## 📦 Installation

### Quick Start (No Build Required!)

1. Clone the repository:
```bash
git clone https://github.com/yourusername/friendly-octo-train.git
cd friendly-octo-train
```

2. Open `index.html` in your browser:
   - **Option 1**: Double-click the `index.html` file
   - **Option 2**: Use a local server (recommended):
     ```bash
     # Using Python 3
     python -m http.server 8000

     # Using Node.js http-server
     npx http-server

     # Using PHP
     php -S localhost:8000
     ```

3. Open your browser to `http://localhost:8000`

That's it! No npm install, no build process, no complicated setup.

## 🌐 GitHub Pages Deployment

1. Push your code to GitHub
2. Go to repository Settings → Pages
3. Select "Deploy from a branch"
4. Choose `main` branch and `/root` folder
5. Click Save
6. Your site will be live at `https://yourusername.github.io/friendly-octo-train`

## 📖 Usage

### Basic Usage

1. **Select a Key**: Choose from C, C#, D, etc. using the key dropdown
2. **Choose a Scale**: Select from 30+ scales organized by category
3. **Change Display Mode**: Toggle between note names, scale degrees, or intervals
4. **Explore Chords**: View harmonized triads and 7th chords
5. **Click Chords**: Click any chord to see its notes highlighted on the fretboard

### Keyboard Shortcuts

*(Coming soon)*

## 🛠️ Technical Details

### Technology Stack

- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6 modules)
- **CSS Framework**: Tailwind CSS (via CDN)
- **Graphics**: SVG for fretboard rendering
- **No build tools required**: Works directly in the browser
- **No dependencies**: All music theory logic is custom-built

### Project Structure

```
friendly-octo-train/
├── index.html              # Main entry point
├── README.md               # This file
├── css/
│   ├── main.css           # General application styles
│   └── fretboard.css      # Fretboard-specific styles
├── js/
│   ├── main.js            # Application initialization
│   ├── core/
│   │   ├── MusicTheory.js     # Core music theory calculations
│   │   ├── ScaleEngine.js     # Scale generation engine
│   │   ├── ChordEngine.js     # Chord harmonization
│   │   └── FretboardModel.js  # Fretboard data model (future)
│   ├── ui/
│   │   ├── FretboardRenderer.js  # SVG fretboard rendering
│   │   ├── ControlPanel.js       # UI controls
│   │   └── InfoPanel.js          # Info display (future)
│   └── data/
│       ├── constants.js   # Musical constants
│       ├── scales.js      # Scale definitions
│       └── chords.js      # Chord formulas (future)
└── assets/
    └── images/            # Images and icons
```

### Architecture

The application uses a modular ES6 architecture with clear separation of concerns:

- **Core Layer**: Music theory logic (notes, intervals, scales, chords)
- **UI Layer**: Rendering and user interaction
- **Data Layer**: Constants and pattern definitions

### Browser Support

- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅
- Mobile browsers ✅

## 🎯 Roadmap

### Planned Features

- [ ] Audio playback using Web Audio API
- [ ] CAGED system visualization
- [ ] Practice mode with ear training
- [ ] Export fretboard as image
- [ ] Dark mode toggle
- [ ] Bass guitar support
- [ ] Ukulele support
- [ ] Custom tunings
- [ ] Chord voicing finder
- [ ] Metronome integration
- [ ] Scale pattern library
- [ ] Keyboard shortcuts
- [ ] Touch gestures for mobile

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write clean, readable code
- Add comments for complex logic
- Test on multiple browsers
- Keep the codebase dependency-free
- Maintain the "no build required" philosophy

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [ChordFiles Guitar Scales Tool](https://www.chordfiles.com/product/scales-guitar/)
- Built with passion for guitarists and music learners
- Thanks to the open-source community

## 📧 Contact

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🌟 Show Your Support

If you find this project helpful, please give it a ⭐️ on GitHub!

---

**Happy practicing! 🎸🎵**
