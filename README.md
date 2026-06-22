# Magnitude — Interactive Mathematics Visualizations

> An open-source interactive mathematics visualization platform for A-Level Further Math students and educators.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-magnitude.vercel.app-6366f1?style=flat-square)](https://magnitude.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-aashi--dani%2Fmathviz-24292f?style=flat-square&logo=github)](https://github.com/aashi-dani/mathviz)
[![License: MIT](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)](LICENSE)

---

## What is Magnitude?

Magnitude goes **beyond Desmos and Seeing Theory** by offering:

- **Deep, explorable visualizations** with rich parameterization
- **Real-time, 60fps animations** powered by Canvas and WebGL
- **A-Level Further Math depth** — correct equations, sound algorithms
- **Equity-focused design** — no login, works on low-bandwidth, MIT licensed

---

## Sections

| Section | Key Visualizations |
|---------|-------------------|
| 🔷 **Pure Mathematics** | Complex Numbers, Mandelbrot/Julia Sets, Parametric Curves, Group Theory |
| 📊 **Statistics & Probability** | Normal Distribution, CLT Simulator, Bayesian Updating, Confidence Intervals |
| ⚙️ **Mechanics** | Projectile Motion, Double Pendulum (RK4), Spring-Mass, Orbital Mechanics |
| 🕸️ **Abstract Algebra** | Graph Explorer (BFS/DFS/Dijkstra), Sorting Visualizer, Recursion Trees |
| 📈 **Math in Finance** | Black-Scholes, Markowitz Portfolio, Binomial Trees, Brownian Motion, VaR |
| 🎓 **Hall of Fame** | Euler, Gauss, Newton, Ramanujan, Riemann, Noether, Bayes, Black-Scholes |

---

## Tech Stack

- **React 18** — functional components with hooks
- **Tailwind CSS 3** — utility-first styling, dark mode via class strategy
- **Vite** — fast build tooling
- **React Router v6** — client-side routing
- **Recharts** — composable charts for statistics and finance
- **KaTeX** — fast LaTeX math rendering
- **mathjs** — Black-Scholes, CLT, statistical functions
- **d3.js** — force-directed graph layouts

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/aashi-dani/mathviz.git magnitude
cd magnitude

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Deployment (Vercel)

This project is configured for zero-config Vercel deployment:

1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Vercel auto-detects Vite — no configuration needed
4. SPA routing handled by `vercel.json`

---

## Project Structure

```
magnitude/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx        # Fixed top nav with glass morphism
│   │   ├── Sidebar.jsx       # Collapsible quick-jump sidebar
│   │   ├── ThemeToggle.jsx   # Dark/light mode toggle
│   │   ├── SectionCard.jsx   # Home page preview cards
│   │   ├── SectionPage.jsx   # Reusable section stub template
│   │   ├── VizCard.jsx       # Visualization placeholder card
│   │   └── MathText.jsx      # KaTeX math renderer
│   ├── context/
│   │   └── ThemeContext.jsx  # Dark mode context + localStorage
│   ├── data/
│   │   └── sections.js       # All section metadata
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Pure.jsx
│   │   ├── Statistics.jsx
│   │   ├── Mechanics.jsx
│   │   ├── AbstractAlgebra.jsx
│   │   ├── Finance.jsx
│   │   └── Mathematicians.jsx
│   ├── App.jsx               # Router + layout shell
│   ├── main.jsx              # Vite entry point
│   └── index.css             # Global styles + Tailwind directives
├── vercel.json               # SPA rewrite rules
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## Roadmap

- **Phase 1 (Week 1):** ✅ Scaffold — routing, navbar, sidebar, dark mode, stub pages
- **Phase 2 (Weeks 2–4):** 🔄 Core visualizations (2–3 per section)
- **Phase 3 (Week 5):** Polish, export/share, mobile pass
- **Phase 4 (Week 6):** Vercel deploy, performance, educator feedback

---

## Contributing

This is an open-source project. PRs welcome!

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/mandelbrot-zoom`
3. Commit and push
4. Open a Pull Request

---

## License

MIT © Aashi Dani — free to use, adapt, and redistribute.
