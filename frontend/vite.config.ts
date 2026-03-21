import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // JSON imports are supported natively in Vite — no extra plugin needed.
  // resolveJsonModule is set in tsconfig.app.json for TypeScript awareness.
})
