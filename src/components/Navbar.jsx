// src/components/Navbar.jsx
// Flat, minimal design (Navy & Grey)

import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { GitBranch, ExternalLink } from 'lucide-react';
import { SECTIONS } from '../data/sections';

const GITHUB_URL = 'https://github.com/aashi-dani/mathviz';
const NAV_SECTIONS = SECTIONS.filter(s => s.id !== 'mathematicians');

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav id="main-navbar" className={`fixed top-0 left-16 right-0 z-40 transition-colors duration-200 ${scrolled ? 'bg-[#0F172A] border-b border-gray-800' : 'bg-[#0F172A] border-b border-gray-800'}`}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pl-4">
        <div className="flex items-center h-16 gap-4">
          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-2 flex-1">
            {NAV_SECTIONS.map((section) => (
              <NavLink
                key={section.id}
                to={section.route}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                {section.shortTitle}
              </NavLink>
            ))}
            <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              About
            </NavLink>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            <a
              id="github-link"
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View on GitHub"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <GitBranch size={16} />
              <span className="hidden md:inline">GitHub</span>
              <ExternalLink size={12} className="opacity-50" />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
