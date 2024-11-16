import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: ['lib/index.ts'],
      formats: ['es', 'cjs'],
      fileName: '[name]',
    },
    minify: true,
    emptyOutDir: false,
    rollupOptions: {
      external: [
        'os',
        'path',
        'fs',
        'process',
        'dotenv',
        'chalk',
        'child_process',
      ],
    },
    target: ['node8', 'es2015'],
  },
});
