import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
export default defineConfig({build:{rollupOptions:{input:{main:fileURLToPath(new URL('./index.html',import.meta.url)),game:fileURLToPath(new URL('./game.html',import.meta.url)),characters:fileURLToPath(new URL('./characters.html',import.meta.url))}}}});
