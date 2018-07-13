import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

export default {
  input: 'src/connectToStores.js',
  output: {
    file: 'dist/connectToStores.js',
    format: 'cjs',
  },
  external: Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.peerDependencies)),
  plugins: [
    resolve(),
    commonjs({
      // Needed for React. See  https://github.com/reduxjs/react-redux/issues/643
      namedExports: {
        'node_modules/react/index.js': ['Component', 'PureComponent', 'Fragment', 'Children', 'createElement'],
      },
    }),
    babel({
      exclude: 'node_modules/**',
    }),
  ],
};
