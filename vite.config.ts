import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return defineConfig({
    plugins: [react()],
    base: '/',
    build: {
      chunkSizeWarningLimit: 3000,
    },
    server: {
      port: Number(env.PORT) || 3002,
      open: true,
      proxy: {
        '/api': env.VITE_API_URL || 'http://localhost:5000',
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify('1.0.0'),
    },
    optimizeDeps: {
      include: ['axios'],
    },
  })
}
