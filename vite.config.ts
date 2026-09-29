import tailwindcss from '@tailwindcss/vite';
import { lingui } from '@lingui/vite-plugin';
import babel from '@rolldown/plugin-babel';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true
    }),
    react(),
    lingui(),
    babel({
      plugins: ['@lingui/babel-plugin-lingui-macro']
    }),
    tailwindcss()
  ],
  server: {
    port: 3000
  }
});
