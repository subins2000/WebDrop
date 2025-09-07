import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
  }
})