// src/components/Sidebar.jsx
// Collapsible sidebar with hover expansion

import { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { SECTIONS } from '../data/sections';

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        fixed top-0 left-0 bottom-0 z-50
        bg-[#0F172A] text-white
        border-r border-gray-800
        transition-all duration-300 ease-in-out
        flex flex-col overflow-hidden shadow-2xl
        ${isHovered ? 'w-64' : 'w-16'}
      `}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center border-b border-gray-800 px-4 shrink-0">
        <Link to="/" className="flex items-center gap-3 w-full" onClick={() => setIsHovered(false)}>
          <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-sm shrink-0">
            ∑
          </div>
          <span className={`text-lg font-bold tracking-tight whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            Magnitude
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-6">
        
        {/* Domain Section */}
        <div>
          <div className={`px-4 mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            {isHovered && "Mathematics"}
          </div>
          <div className="space-y-1">
            {SECTIONS.filter(s => s.id !== 'mathematicians').map((section) => {
              const isActive = location.pathname.startsWith(section.route);
              return (
                <NavLink
                  key={section.id}
                  to={section.route}
                  onClick={() => setIsHovered(false)}
                  className={`flex items-center px-2 py-2 mx-2 gap-3 rounded-md text-[16px] font-semibold tracking-[-0.3px] font-sans transition-colors
                    ${isActive ? 'bg-blue-900/50 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                  `}
                >
                  <div className="w-8 flex items-center justify-center shrink-0">
                    <span className="font-mono text-xs font-bold" style={{ color: isActive ? '#3B82F6' : 'inherit' }}>
                      {section.icon}
                    </span>
                  </div>
                  <span className={`whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    {section.shortTitle}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-800 mx-4" />

        {/* Hall of Fame */}
        <div>
          <div className={`px-4 mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            {isHovered && "Hall of Fame"}
          </div>
          {SECTIONS.filter(s => s.id === 'mathematicians').map((section) => {
            const isActive = location.pathname.startsWith(section.route);
            return (
              <NavLink
                key={section.id}
                to={section.route}
                onClick={() => setIsHovered(false)}
                className={`flex items-center px-2 py-2 mx-2 gap-3 rounded-md text-[16px] font-semibold tracking-[-0.3px] font-sans transition-colors
                  ${isActive ? 'bg-blue-900/50 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}
                `}
              >
                <div className="w-8 flex items-center justify-center shrink-0">
                  <span className="font-mono text-xs font-bold" style={{ color: isActive ? '#3B82F6' : 'inherit' }}>
                    {section.icon}
                  </span>
                </div>
                <span className={`whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                  {section.shortTitle}
                </span>
              </NavLink>
            );
          })}
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-800 mx-4" />

        {/* About */}
        <div>
          <div className={`px-4 mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            {isHovered && "General"}
          </div>
          <NavLink
            to="/about"
            onClick={() => setIsHovered(false)}
            className={({ isActive }) => `flex items-center px-2 py-2 mx-2 gap-3 rounded-md text-[16px] font-semibold tracking-[-0.3px] font-sans transition-colors
              ${isActive ? 'bg-blue-900/50 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}
            `}
          >
            <div className="w-8 flex items-center justify-center shrink-0">
              <span className="font-mono text-xs font-bold text-gray-400">?</span>
            </div>
            <span className={`whitespace-nowrap transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              About
            </span>
          </NavLink>
        </div>

      </nav>
    </aside>
  );
}
