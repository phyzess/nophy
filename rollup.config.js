import path from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import packageJson from './package.json';

const extensions = ['.ts'];

const resolve = function (...args) {
  return path.resolve(__dirname, ...args);
};

export default {
  input: 'src/index.ts',
  output: {
    file: resolve('./', packageJson.main),
    name: 'nophy',
    format: 'umd',
  },
  plugins: [
    nodeResolve({
      extensions,
    }),
    babel({
      exclude: 'node_modules/**',
      extensions,
    }),
  ],
};
