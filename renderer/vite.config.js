import { defineConfig } from "vite";
import react from '@vitejs/plugin-react';
import tsPaths from 'vite-tsconfig-paths';
import renderer from 'vite-plugin-electron-renderer';

export default defineConfig({
    plugins: [react(), tsPaths(), renderer()],
    base: "./",
    build: {
        outDir: "../app/build"
    },
    server: {
        port: 3001,
        open: false
    }
})