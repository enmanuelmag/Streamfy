/// <reference types="vitest" />
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import { compression } from 'vite-plugin-compression2'
//import { qrcode } from 'vite-plugin-qrcode'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@src': resolve(__dirname, './src'),
      '@api': resolve(__dirname, './src/api'),
      '@assets': resolve(__dirname, './src/assets'),
      '@components': resolve(__dirname, './src/components'),
      '@constants': resolve(__dirname, './src/constants'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@shared': resolve(__dirname, './src/shared'),
      '@types': resolve(__dirname, './src/types'),
      '@utils': resolve(__dirname, './src/utils'),
      '@pages': resolve(__dirname, './src/pages'),
    },
  },
  envDir: resolve(__dirname, '..', '..', 'global', 'env'),
  plugins: [
    react(),
    //qrcode(),
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
    }),
  ],
  server: {
    watch: {
      usePolling: true,
    },
    host: true, // needed for the Docker Container port mapping to work
    strictPort: true,
    port: 3500, // you can replace this port with any port
  },
  preview: {
    host: true, // needed for the Docker Container port mapping to work
    strictPort: true,
    port: 3500, // you can replace this port with any port
  },
  test: {
    globals: true,
    watch: false,
    environment: 'happy-dom',
    setupFiles: './src/setup-test.ts',
  },
  build: {
    sourcemap: true,
    target: 'esnext',
    minify: true,
    cssTarget: 'esnext',
    cssMinify: true,
    cssCodeSplit: true,
    modulePreload: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react/jsx-runtime', 'react-dom'],
        },
      },
    },
  },
})
