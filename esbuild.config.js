const esbuild = require('esbuild');

const watch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const opts = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'out/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  target: 'es2022',
  sourcemap: true,
  minify: !watch,
};

if (watch) {
  esbuild.context(opts).then(ctx => {
    ctx.watch();
    console.log('Watching for changes...');
  });
} else {
  esbuild.build(opts).then(result => {
    console.log('Done in', result?.errors?.length || 0, 'errors');
  });
}
