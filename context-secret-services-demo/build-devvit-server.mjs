import { build } from 'esbuild';
await build({entryPoints:['devvit-server.js'],outfile:'dist-server/index.cjs',bundle:true,platform:'node',format:'cjs',target:'node22'});
