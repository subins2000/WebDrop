import { defineConfig } from 'vite'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      // necessary for randombytes lib to work
      define: {
        global: 'globalThis'
      },
      // Enable esbuild polyfill plugins
      // necessary for some libs to work
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        })
      ]
    }
  }
})