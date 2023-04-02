import * as path from 'path';
import * as VitestConfig from 'vitest/config';

export default VitestConfig.defineConfig({
  test: {
    // See the list of config options in the Config Reference:
    // https://vitest.dev/config/
    globals: true,
    includeSource: ['app/**/*.{ts,tsx}'],
    exclude: ['node_modules', 'e2e'],
    coverage: {
      exclude: ['app/**/*.{spec,test}.{ts,tsx}', '**/__mocks__/*.{ts,tsx}'],
      reporter: ['text', 'html', 'json'],
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'app'),
    },
  },
});
