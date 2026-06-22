import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    // Use PostCSS (not lightningcss) so Tailwind @apply works correctly
    transformer: 'postcss',
  },
})
