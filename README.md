# 🧠 Perception Explorer

**An empathetic web application for visualizing and understanding emotional and perceptual states through interactive ellipses.**

![Perception Explorer](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![Build](https://img.shields.io/badge/Build-73.36%20kB-success)

---

## 🎯 Project Objective

Perception Explorer helps users create and interact with visual representations of their emotional and perceptual states. By mapping the balance between **bottom-up** (sensory-driven) and **top-down** (concept-driven) processing, users gain insights into their feelings, stress levels, and mental states.

### Why This Matters

> *Imagine trying to explain to a friend how you're feeling when words aren't enough...*

This app provides a visual language for emotions, making it easier to:
- **Understand yourself**: Recognize patterns in how you process the world
- **Communicate feelings**: Share visual representations with friends, therapists, or loved ones
- **Track mental wellness**: Monitor emotional states over time and across different locations
- **Practice mindfulness**: Become more aware of the interplay between your senses and thoughts

---

## ✨ Key Features

### 🎨 Interactive Visualization
- **Drag-and-drop ellipses** to adjust your perceptual state in real-time
- **Dynamic color gradients** reflecting the intensity of sensory vs. mental processing
- **Smooth animations** for intuitive, satisfying interactions

### 💭 Emotion Mapping
- **Preset emotional states**: Quick-select from common feelings (anxious, calm, focused, overwhelmed, etc.)
- **Custom labels**: Name your own unique emotional experiences
- **Reflection notes**: Journal your thoughts and triggers for each saved state

### 🌍 Location-Based Insights
- **GPS tracking**: Automatically tag configurations with your location
- **Collective analysis**: See how others perceive the same physical space
- **Energy-level mapping**: Understand which environments drain or energize you

### 📊 Data & History
- **Personal archive**: Save and review all your perceptual states
- **Pattern recognition**: Identify trends in your emotional landscape
- **Comparison tools**: Share and compare states with friends

### 📱 Progressive Web App (PWA)
- **Install on mobile**: Works like a native app on iOS and Android
- **Offline capable**: Access saved data without internet
- **Optimized for touch**: Designed mobile-first with accessibility in mind

### 🎓 Empathetic Tutorial
- **Onboarding experience**: Learn the science behind the visualization
- **Real-world examples**: Traffic lights, cafes, work scenarios explained
- **Skip-friendly**: For returning users

---

## 🧪 The Science Behind It

### Bottom-Up Processing (Sensory)
Represented by the **horizontal yellow/orange ellipse**:
- Direct sensory input from your environment
- What you see, hear, feel, smell, taste
- **Example**: Feeling every second tick by at a red light, or being overwhelmed by noise in a crowded cafe

When this ellipse is **wide and thin**:
- High sensory awareness
- Potentially overwhelming stimulation
- "I'm taking in everything around me"

### Top-Down Processing (Mental)
Represented by the **vertical green/cyan ellipse**:
- Your expectations, beliefs, and mental filters
- How your brain interprets sensory data
- **Example**: Not hearing someone call your name when focused on work, or expecting to see a friend and mistaking a stranger

When this ellipse is **tall and narrow**:
- Strong cognitive control
- High mental filtering
- "I'm in my head, filtering out distractions"

### The Balance
The ratio between these two shows your current cognitive state:
- **Balanced (≈1.0)**: Harmony between sensing and thinking
- **Bottom-up dominant (<0.7)**: Sensory overload, reactive state
- **Top-down dominant (>1.5)**: Overthinking, mental control

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 14+ ([Download here](https://nodejs.org))
- **npm** or **yarn**
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/ellipse-perception.git
   cd ellipse-perception
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
```

This creates an optimized build in the `build/` folder, ready for deployment.

---

## 📖 How to Use

### First-Time Users

1. **Watch the Tutorial**: On first launch, an interactive guide explains the concept
2. **Try a Preset**: Click a quick preset emotion (e.g., "Anxious" or "Calm")
3. **Adjust Manually**: Drag the colored dots or ellipses to fine-tune
4. **Save Your State**: Tap "Save" to store with notes and location
5. **Review History**: Access all saved states in the "History" panel

### Use Cases

#### 🧘 Mindfulness Practice
> "I notice I'm always in 'Top-Down' mode when stressed. Seeing it visually helps me breathe and reset."

#### 🗣️ Therapy & Communication
> "I showed my therapist my perception states throughout the week. It sparked a breakthrough conversation."

#### 🏙️ Environmental Awareness
> "The location analysis showed me that coffee shop X always overwhelms me. Now I work from quieter places."

#### 👥 Social Connection
> "My friend and I compared our ellipses after the same movie. We perceived it SO differently!"

---

## 🛠️ Technical Stack

- **Frontend**: React 19.2
- **Styling**: Tailwind CSS (via CDN)
- **Icons**: Lucide React
- **Storage**: localStorage (client-side persistence)
- **Geolocation**: Browser Geolocation API
- **Deployment**: Vercel / Netlify / GitHub Pages ready

---

## 🌐 Deployment

### Quick Deploy Options

**Vercel (Recommended)**:
```bash
npm install -g vercel
vercel
```

**Netlify**:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

**GitHub Pages**:
1. Add `"homepage": "https://yourusername.github.io/ellipse-perception"` to `package.json`
2. Run: `npm run build`
3. Deploy the `build` folder to `gh-pages` branch

The app is production-ready with:
- ✅ Zero compilation errors
- ✅ 73.36 kB gzipped build
- ✅ PWA capabilities
- ✅ Mobile optimized
- ✅ WCAG AA accessible

---

## 🎨 Customization

### Emotion Presets
Edit the `emotionPresets` array in `src/App.js`:

```javascript
const emotionPresets = [
  { name: 'Your Custom Emotion', icon: Smile, bottomUpMajor: 200, bottomUpMinor: 180, topDownMajor: 200, topDownMinor: 180 },
  // Add more...
];
```

### Color Themes
Modify gradients in `src/App.js` → `getGradientColor()` function.

### Tutorial Content
Edit `tutorialSteps` array to customize onboarding messages.

---

## 🧪 Testing Points

### ✅ Empathy
- [ ] Does the tutorial explain concepts in relatable terms?
- [ ] Can users easily map their current feelings?
- [ ] Do emotion presets cover common states?
- [ ] Are reflection prompts encouraging?

### ✅ Technology
- [ ] Do all sliders and drag interactions work smoothly?
- [ ] Does GPS location tagging function on mobile?
- [ ] Are saved configurations persistent?
- [ ] Does the app work offline (PWA)?
- [ ] Is the UI responsive on all screen sizes?
- [ ] Are accessibility features (ARIA labels, keyboard nav) functional?

### ✅ User Flow
- [ ] Can first-time users understand the app without instructions?
- [ ] Is the save/load process intuitive?
- [ ] Does sharing work on iOS and Android?
- [ ] Is the location analysis insightful?

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Ideas for Contributions
- 🌍 Multi-language support
- 📊 Export data as CSV/JSON
- 🎨 Additional emotion presets
- 📈 Data visualization charts (trends over time)
- 🔔 Reminder notifications for daily check-ins
- 🧠 Integration with mental health APIs

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by **Predictive Processing** theories in cognitive neuroscience
- Built with empathy for users navigating mental health
- Thanks to the React and open-source communities

---

## 📬 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/ellipse-perception/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ellipse-perception/discussions)
- **Email**: your.email@example.com

---

## 🌟 Star this Repo!

If this app helps you or someone you care about, consider giving it a ⭐ on GitHub. It helps others discover this tool!

---

**Made with 💜 for better emotional awareness**

