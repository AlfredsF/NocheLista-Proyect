import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: '../dist',  // Guarda el build en la raíz del proyecto (fuera de frontend-react)
    emptyOutDir: true,   // Limpia la carpeta dist antes de cada build
  },
});