import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    outDir: 'dist',  // Asegúrate de que los archivos de compilación se coloquen en esta carpeta
    emptyOutDir: true,  // Borra la carpeta dist antes de generar nuevos archivos (opcional, pero útil)
  }
})
