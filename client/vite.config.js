import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The Base44 preview reaches this dev server through a proxy whose Host header is
// "<port>-<sandbox id>.$BASE44_SANDBOX_HOST_DOMAIN" (the sandbox id rotates, so we
// allow the domain and its subdomains). Vite rejects unknown hosts by default, so
// we extend the allowlist ONLY while the sandbox flag is on; with the flag unset
// the allowlist keeps its normal dev defaults.
const allowedHosts = ['localhost', '127.0.0.1']
if (process.env.BASE44_PREVIEW_MODE === '1' && process.env.BASE44_SANDBOX_HOST_DOMAIN) {
  allowedHosts.push(`.${process.env.BASE44_SANDBOX_HOST_DOMAIN}`)
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts,
    // Single origin: the browser only talks to port 3000, so API calls are proxied
    // to the api service here instead of going cross-origin.
    proxy: {
      '/api': {
        target: 'http://api:8000',
        changeOrigin: true,
      },
    },
  },
})
