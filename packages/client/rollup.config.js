import scss from 'rollup-plugin-scss'
import postcss from 'postcss'
import autoprefixer from 'autoprefixer'
import uglify from "@lopatnov/rollup-plugin-uglify";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: 'src/index.ts',
  context: 'window',
  output: [
    {
      file: 'build/slavik.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'build/slavik.esm.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'build/slavik.umd.js',
      format: 'umd',
      name: 'slavik',
      globals: {},
      sourcemap: true
    }
  ],
  plugins: [
    scss({
      processor: () => postcss([autoprefixer()]),
      outputStyle: 'compressed'
    }),
    uglify(),
    typescript({ tsconfig: './tsconfig.json' }),
    commonjs({
      include: /node_modules/,
      requireReturnsDefault: "auto",
    }),
  ]
}
