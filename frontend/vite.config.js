import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

if (process.env.VERCEL === '1' && !process.env.VITE_DJANGO_BASE_URL?.trim()) {
  throw new Error('Set VITE_DJANGO_BASE_URL to the backend Vercel project URL.')
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
})
