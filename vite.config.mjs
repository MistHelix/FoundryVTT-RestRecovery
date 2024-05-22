import { svelte } from '@sveltejs/vite-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve'; // This resolves NPM modules from node_modules.
import preprocess from 'svelte-preprocess';
import {
  postcssConfig,
  terserConfig
} from '@typhonjs-fvtt/runtime/rollup';

const s_PACKAGE_ID = 'modules/rest-recovery';

const s_SVELTE_HASH_ID = 'rr';

const s_COMPRESS = false;  // Set to true to compress the module bundle.
const s_SOURCEMAPS = true; // Generate sourcemaps for the bundle (recommended).


// Used in bundling.
const s_RESOLVE_CONFIG = {
  browser: true,
  dedupe: ['svelte']
};

// ATTENTION!
// You must change `base` and the `proxy` strings replacing `/modules/item-piles/` with your
// module or system ID.

export default () => {
  /** @type {import('vite').UserConfig} */
  return {
    root: 'scripts/',                             // Source location / esbuild root.
    base: `/${s_PACKAGE_ID}/`,   // Base module path that 30001 / served dev directory.
    publicDir: false,                         // No public resources to copy.
    cacheDir: '../.vite-cache',               // Relative from root directory.
    
    resolve: { conditions: ['import', 'browser'] },
    
    esbuild: {
      target: ['es2022', 'chrome100'],
      keepNames: true   // Note: doesn't seem to work.
    },
    
    css: {
      // Creates a standard configuration for PostCSS with autoprefixer & postcss-preset-env.
      postcss: postcssConfig({ compress: s_COMPRESS, sourceMap: s_SOURCEMAPS })
    },
    
    // About server options:
    // - Set to `open` to boolean `false` to not open a browser window automatically. This is useful if you set up a
    // debugger instance in your IDE and launch it with the URL: 'http://localhost:30001/game'.
    //
    // - The top proxy entry for `lang` will pull the language resources from the main Foundry / 30000 server. This
    // is necessary to reference the dev resources as the root is `/src` and there is no public / static resources
    // served.
    server: {
      port: 29999,
      open: false,
      proxy: {
        [`^(/${s_PACKAGE_ID}/(languages|assets|packs|style.css))`]: 'http://127.0.0.1:30000',
        [`^(?!/${s_PACKAGE_ID}/)`]: 'http://127.0.0.1:30000',
        '/socket.io': { target: 'ws://127.0.0.1:30000', ws: true }
      }
    },
    
    build: {
      outDir: __dirname,
      emptyOutDir: false,
      sourcemap: s_SOURCEMAPS,
      brotliSize: true,
      minify: s_COMPRESS ? 'terser' : false,
      target: ['es2022', 'chrome100'],
      terserOptions: s_COMPRESS ? { ...terserConfig(), ecma: 2022 } : void 0,
      lib: {
        entry: './module.js',
        formats: ['es'],
        fileName: 'module'
      }
    },
    
    plugins: [
      svelte({
        compilerOptions: {
          cssHash: ({ hash, css }) => `svelte-${s_SVELTE_HASH_ID}-${hash(css)}`
        },
        preprocess: preprocess()
      }),
      
      resolve(s_RESOLVE_CONFIG),    // Necessary when bundling npm-linked packages.
    ]
  };
};

