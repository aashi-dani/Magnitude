// src/App.jsx
// Root application — router, layout shell (Navbar + Sidebar), and page outlet

import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import Home from './pages/Home';
import About from './pages/About';
import Pure from './pages/Pure';
import Statistics from './pages/Statistics';
import Mechanics from './pages/Mechanics';
import AbstractAlgebra from './pages/AbstractAlgebra';
import Finance from './pages/Finance';
import Mathematicians from './pages/Mathematicians';

// ── Root layout component (shared by all pages) ────────────────────────────
function RootLayout() {
  return (
    <div className="min-h-screen bg-white">
      {/* Scroll to top on route change */}
      <ScrollRestoration />

      {/* Fixed navbar */}
      <Navbar />

      {/* Sidebar + main content */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <Sidebar />

        {/* Page content — offset by sidebar width (w-16 = 4rem = 64px) */}
        <div className="flex-1 min-w-0 transition-all duration-300 ml-16">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

// ── 404 Not Found ────────────────────────────────────────────────────────────
function NotFound() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center ml-16">
      <span className="text-8xl font-black font-mono text-gray-200 mb-4">404</span>
      <h1 className="text-2xl font-bold text-gray-700 mb-2">Page not found</h1>
      <p className="text-gray-400 text-sm mb-8">
        This route doesn't exist — yet. Check the sidebar for all available sections.
      </p>
      <a href="/" className="btn-primary">Back to Home</a>
    </main>
  );
}

// ── Router configuration ─────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true,              element: <Home /> },
      { path: 'about',            element: <About /> },
      { path: 'pure',             element: <Pure /> },
      { path: 'statistics',       element: <Statistics /> },
      { path: 'mechanics',        element: <Mechanics /> },
      { path: 'abstract',         element: <AbstractAlgebra /> },
      { path: 'finance',          element: <Finance /> },
      { path: 'mathematicians',   element: <Mathematicians /> },
      { path: '*',                element: <NotFound /> },
    ],
  },
]);

// ── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
