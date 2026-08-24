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
        blogRealEstate: './blog/real-estate-whatsapp-enquiries.html',
      },
    },
  },
});
