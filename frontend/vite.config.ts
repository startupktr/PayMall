import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // This splits node_modules into a separate vendor chunk
          if (id.includes('node_modules')) {
            // Split Recharts into its own chunk
            if (id.includes('recharts')) return 'vendor-charts';
            // Split Lucide icons (often very large)
            if (id.includes('lucide-react')) return 'vendor-icons';
            // Split ZXing/Barcode logic
            if (id.includes('zxing')) return 'vendor-scanner';
            
            return 'vendor';
          }
        },
      },
    },
  },
})
