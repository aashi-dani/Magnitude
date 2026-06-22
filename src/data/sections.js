// src/data/sections.js
// Central metadata for all sections — used by Navbar, Sidebar, Home cards, and stub pages

export const SECTIONS = [
  {
    id: 'pure',
    title: 'Pure Mathematics',
    shortTitle: 'Pure',
    route: '/pure',
    color: '#1E3A8A',       // Navy Blue
    icon: '∑',
    tagline: 'Abstract structures, proofs, geometric elegance',
    description:
      'Explore the abstract beauty of mathematics — from complex numbers dancing in the plane to fractal infinities and the symmetry of group theory.',
    visualizations: [
      { id: 'complex-numbers', title: 'Complex Numbers in the Plane', desc: 'Visualize rotation, multiplication, and Euler\'s formula e^(iθ)', difficulty: 'Medium' },
      { id: 'polar-coordinates', title: 'Polar Coordinates', desc: 'Explore curves defined by radius r as a function of angle θ', difficulty: 'Easy' },
      { id: 'mandelbrot', title: 'Mandelbrot & Julia Sets', desc: 'Zoom into the infinite fractal boundary with smooth coloring', difficulty: 'Hard' },
      { id: 'matrix-transformations', title: 'Matrix Transformations', desc: 'See how 2x2 matrices transform 2D space linearly', difficulty: 'Medium' },
      { id: 'parametric-curves', title: 'Parametric Curves', desc: 'Lissajous figures, roses, spirals with live parameter sweeps', difficulty: 'Easy' },
      { id: 'hyperbolic-functions', title: 'Hyperbolic Functions', desc: 'Explore sinh, cosh, and tanh curves and their identities', difficulty: 'Easy' },
            { id: 'fourier-series', title: 'Fourier Series Synthesis', desc: 'Build complex waveforms by summing sine and cosine harmonics', difficulty: 'Medium' },
      { id: '3d-surfaces', title: '3D Mathematical Surfaces', desc: 'Visualize multivariable functions and topological shapes in full 3D', difficulty: 'Hard' },
    ],
  },
  {
    id: 'statistics',
    title: 'Statistics & Probability',
    shortTitle: 'Statistics',
    route: '/statistics',
    color: '#4B5563',       // Grey
    icon: '𝜇',
    tagline: 'Data intuition, distributions, inference',
    description:
      'Build deep statistical intuition by seeing distributions morph in real time, sampling from the Central Limit Theorem, and watching Bayesian beliefs update.',
    visualizations: [
      { id: 'normal-dist', title: 'Normal Distribution Explorer', desc: 'Adjust μ and σ; see z-scores and percentiles update live', difficulty: 'Easy' },
      { id: 'clt-simulator', title: 'Central Limit Theorem', desc: 'Watch sample means converge to normality from any distribution', difficulty: 'Medium' },
      { id: 'correlation', title: 'Correlation vs. Causation', desc: 'Add/remove points and see r² and regression update dynamically', difficulty: 'Easy' },
      { id: 'bayesian', title: 'Bayesian Updating', desc: 'Prior → Likelihood → Posterior with interactive belief sliders', difficulty: 'Hard' },
      { id: 'confidence-intervals', title: 'Confidence Intervals', desc: 'Simulate repeated sampling and see what 95% CI really means', difficulty: 'Medium' },
    ],
  },
  {
    id: 'mechanics',
    title: 'Mechanics',
    shortTitle: 'Mechanics',
    route: '/mechanics',
    color: '#1E3A8A',       // Navy Blue
    icon: '⃗F',
    tagline: 'Physics + differential equations made visual',
    description:
      'From projectiles arcing through the air to the chaotic dance of a double pendulum — see physics equations come alive through real-time simulation.',
    visualizations: [
      { id: 'projectile', title: 'Projectile Motion', desc: 'Launch angle, velocity, air resistance — watch the parabolic arc', difficulty: 'Easy' },
      { id: 'pendulum', title: 'Pendulum (Simple & Double)', desc: 'RK4 physics simulation with phase space and chaos demo', difficulty: 'Hard' },
      { id: 'spring-mass', title: 'Spring-Mass Oscillator', desc: 'Damping regimes, Fourier frequency spectrum of oscillations', difficulty: 'Medium' },
      { id: 'orbital', title: 'Orbital Mechanics', desc: 'Kepler orbits with adjustable eccentricity and energy conservation', difficulty: 'Hard' },
    ],
  },
  {
    id: 'abstract',
    title: 'Abstract Algebra & Discrete Math',
    shortTitle: 'Abstract',
    route: '/abstract',
    color: '#4B5563',       // Grey
    icon: '∀',
    tagline: 'Structures, algorithms, combinatorics',
    description:
      'Step through sorting algorithms, explore graph structures with force-directed layouts, and visualize recursion trees with memoization.',
    visualizations: [
      { id: 'graph-explorer', title: 'Graph Theory Explorer', desc: 'Create nodes/edges; run BFS, DFS, Dijkstra step-by-step', difficulty: 'Medium' },
      { id: 'sorting', title: 'Sorting Algorithm Visualizer', desc: 'Merge, quick, heap sort side-by-side with comparison counts', difficulty: 'Easy' },
      { id: 'recursion-trees', title: 'Recursion Trees', desc: 'Fibonacci, factorial with call stack and memoization highlights', difficulty: 'Medium' },
      { id: 'lattice', title: 'Lattice & Poset Diagrams', desc: 'Draw partially ordered sets; highlight GLB and LUB', difficulty: 'Hard' },
    ],
  },
  {
    id: 'finance',
    title: 'Math in Finance',
    shortTitle: 'Finance',
    route: '/finance',
    color: '#1E3A8A',       // Navy Blue
    icon: '$',
    tagline: 'Quantitative finance, portfolio theory, derivative pricing',
    description:
      'Pricing options with Black-Scholes, optimizing portfolios on the efficient frontier, and simulating Brownian motion — the mathematics of markets.',
    visualizations: [
      { id: 'Black-Scholes', title: 'Black-Scholes Option Pricing', desc: 'Live call/put prices, Greeks, and volatility surface', difficulty: 'Hard' },
      { id: 'markowitz', title: 'Markowitz Portfolio Optimization', desc: 'Efficient frontier, minimum variance, and tangency portfolio', difficulty: 'Medium' },
      { id: 'binomial-tree', title: 'Binomial Tree Pricing', desc: 'Build option trees step-by-step, compare to Black-Scholes', difficulty: 'Hard' },
      { id: 'brownian-motion', title: 'Random Walk & Brownian Motion', desc: 'Simulate geometric Brownian motion stock price paths', difficulty: 'Easy' },
      { id: 'var-simulator', title: 'Value at Risk (VaR) Simulator', desc: 'Loss distributions and tail risk at 95%/99% confidence', difficulty: 'Medium' },
    ],
  },
  {
    id: 'mathematicians',
    title: 'Hall of Fame',
    shortTitle: 'Mathematicians',
    route: '/mathematicians',
    color: '#4B5563',       // Grey
    icon: '∞',
    tagline: 'The giants on whose shoulders we stand',
    description:
      'Meet the mathematicians who shaped modern mathematics — from Euler\'s prolific genius to Ramanujan\'s miraculous intuition.',
    visualizations: [
      { id: 'euler', title: 'Leonhard Euler', desc: 'Complex analysis, graph theory, and the most beautiful equation' },
      { id: 'gauss', title: 'Carl Friedrich Gauss', desc: 'Number theory, statistics, and the Gaussian distribution' },
      { id: 'ramanujan', title: 'Srinivasa Ramanujan', desc: 'Infinite series, partition theory, mock theta functions' },
      { id: 'riemann', title: 'Bernhard Riemann', desc: 'Riemannian geometry, the Riemann hypothesis, zeta function' },
    ],
  },
];

/** Map from section id → section object */
export const SECTION_MAP = Object.fromEntries(SECTIONS.map((s) => [s.id, s]));

/** Flat list of all visualizations with parent section info */
export const ALL_VISUALIZATIONS = SECTIONS.flatMap((section) =>
  section.visualizations.map((viz) => ({ ...viz, section }))
);
