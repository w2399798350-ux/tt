
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 确保 process.env 可用，以便符合 @google/genai SDK 的调用规范
    'process.env': process.env
  }
});
