import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
// base './' lets the build work at a domain root or a sub-path (e.g. GitHub Pages).
export default defineConfig({base:'./',plugins:[react()],build:{target:'es2019'}});
