import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        viteStaticCopy({
            targets: [
                {
                    src: 'public/manifest.json',
                    dest: '.',
                },
            ],
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        outDir: 'build',
        rollupOptions: {
            input: {
                main: './index.html',
                background: './src/background/background.ts',
                content: './src/content/content.ts',
            },
            output: {
                entryFileNames: (chunkInfo) => {
                    if (chunkInfo.name === 'content') {
                        return 'content.js';
                    } else if (chunkInfo.name === 'background') {
                        return 'background.js';
                    } else {
                        return 'assets/[name]-[hash].js';
                    }
                },
            },
        },
    },
});