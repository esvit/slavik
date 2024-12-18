import scss from 'rollup-plugin-scss'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import { nodeResolve } from '@rollup/plugin-node-resolve';
import uglify from "@lopatnov/rollup-plugin-uglify";

export default {
  input: 'assets/js/main.js',
  context: 'window',
  output: {
    strict: false,
    file: 'build/assets/main.js',
    format: 'umd',
    // Removes the hash from the asset filename
    assetFileNames: '[name][extname]',
  },
  plugins: [
    nodeResolve(),
    scss({
      processor: () => postcss([autoprefixer()]),
      outputStyle: 'compressed'
    }),
    uglify(),
  ]
}
