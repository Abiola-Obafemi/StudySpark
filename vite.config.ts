import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    // 'base' must be './' for the app to work when hosted in a subdirectory (like GitHub Pages)
    base: './',
    define: {
      // specific replacement for the process.env.API_KEY usage in gemini.ts
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});