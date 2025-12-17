import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative base path so it deploys to any GitHub Pages repo/subdirectory automatically
  // without needing to change this config file.
  base: './', 
});