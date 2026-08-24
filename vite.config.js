import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        privacy: './privacy.html',
        terms: './terms.html',
        blog: './blog.html',
        blogProperty24: './blog/property24-whatsapp-enquiries.html',
      },
    },
  },
});
