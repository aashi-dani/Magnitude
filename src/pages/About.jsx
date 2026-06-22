import { ExternalLink, GitBranch } from 'lucide-react';

export default function About() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section className="pt-32 pb-20 px-6 max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-[#0F172A] mb-6 tracking-tight leading-[1.1]">
          Magnitude
        </h1>
        <p className="text-2xl text-gray-500 font-medium tracking-tight">
          Making rigorous mathematics accessible.
        </p>
      </section>

      {/* why Magnitude? */}
      <section className="py-20 px-6 max-w-3xl mx-auto border-t border-gray-200">
        <h2 className="text-3xl font-bold text-[#0F172A] mb-8 tracking-tight">
          why MAGNITUDE?
        </h2>
        <div className="text-gray-600 text-lg md:text-xl">
          <p className="mb-6 leading-relaxed">
            For when the algebra makes sense, the definitions make sense — but you just can't <em>SEE</em> it.
          </p>
          <p className="leading-relaxed">
            Magnitude helps you make it Real. Tangible. Visual. The only way a brain can actually process it — atleast mine.
          </p>
        </div>
      </section>


      {/* Get Involved */}
      <section className="py-20 px-6 max-w-3xl mx-auto border-t border-gray-200">
        <h2 className="text-3xl font-bold text-[#0F172A] mb-8 tracking-tight">
          Want to Help?
        </h2>
        <div className="text-gray-600 text-lg md:text-xl mb-10">
          <p className="mb-6 leading-relaxed">
            Magnitude is open-source. If you find bugs, have ideas, or want to 
            build a visualization — GitHub issues and pull requests welcome.
          </p>
          <p className="leading-relaxed">
            Or if you're a student who finds this helpful, that's the real win. 
            Use it. Share it. Tell me what's broken.
          </p>
        </div>
        
        <a
          href="https://github.com/aashi-dani/mathviz"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-4 px-6 py-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
        >
          <GitBranch size={22} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
          <div className="flex-1 text-left">
            <p className="font-bold text-gray-900 text-lg m-0">GitHub Repository</p>
          </div>
          <ExternalLink size={20} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
        </a>
      </section>

      {/* Tech stack - SMALL & SUBTLE (THIS IS THE FOOTER) */}
      <section className="py-16 px-6 max-w-3xl mx-auto border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-2">
          Built with React, Vite, Tailwind CSS, Recharts, D3.js, Three.js, KaTeX, MathJS
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Deployed on Vercel. Code on GitHub.
        </p>
        <p className="text-xs text-gray-400 mt-8 font-mono">
          Made by AD, June 2026.
        </p>
        <p className="text-xs text-gray-400 font-mono">
          Math Geek × Code × Math Education
        </p>
      </section>
    </main>
  );
}
