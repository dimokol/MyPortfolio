import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Exclude inspiration projects from being served
      deny: ['**/inspiration-projects/**']
    }
  },
  optimizeDeps: {
    exclude: ['inspiration-projects']
  }
})
