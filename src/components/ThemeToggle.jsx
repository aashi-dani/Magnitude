// src/components/ThemeToggle.jsx
// Dark / light mode toggle button

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      id="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative w-9 h-9 flex items-center justify-center rounded-lg
        text-slate-500 dark:text-slate-400
        hover:text-slate-700 dark:hover:text-slate-200
        hover:bg-slate-100 dark:hover:bg-slate-800
        transition-all duration-200"
    >
      {/* Sun icon */}
      <Sun
        size={18}
        className={`absolute transition-all duration-300 ${
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
        }`}
      />
      {/* Moon icon */}
      <Moon
        size={18}
        className={`absolute transition-all duration-300 ${
          isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        }`}
      />
    </button>
  );
}
