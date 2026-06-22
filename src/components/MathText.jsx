// src/components/MathText.jsx
// KaTeX inline/block math renderer
// Usage: <MathText math="e^{i\theta} = \cos\theta + i\sin\theta" />
//        <MathText math="\int_0^\infty" block />

import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renders a LaTeX math expression using KaTeX.
 * @param {object} props
 * @param {string} props.math  - LaTeX string (without delimiters)
 * @param {boolean} [props.block] - If true, renders as display math (block)
 * @param {string} [props.className] - Additional CSS classes
 */
export default function MathText({ math, block = false, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      katex.render(math, ref.current, {
        throwOnError: false,
        displayMode: block,
        strict: 'ignore',
        trust: false,
      });
    } catch (err) {
      ref.current.textContent = math; // Fallback to plain text
    }
  }, [math, block]);

  return (
    <span
      ref={ref}
      className={`${block ? 'block my-4 overflow-x-auto' : 'inline'} ${className}`}
      aria-label={`Math: ${math}`}
    />
  );
}
