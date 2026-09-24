import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-time proxies avoid CORS issues with the public job APIs.
const t = (target, to) => ({ target, changeOrigin: true, rewrite: (p) => p.replace(/^\/proxy\/\w+/, to) })
const proxy = {
  '/proxy/remotive': t('https://remotive.com', '/api'),
  '/proxy/arbeitnow': t('https://www.arbeitnow.com', '/api'),
  '/proxy/jobicy': t('https://jobicy.com', '/api/v2'),
  '/proxy/muse': t('https://www.themuse.com', '/api/public'),
}
export default defineConfig({ plugins: [react()], server: { proxy }, preview: { proxy } })
