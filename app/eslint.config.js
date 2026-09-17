import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist-server/**', 'web/dist/**', 'node_modules/**'],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['web/src/**'],
    rules: {
      // Rapid UI layer: API payloads are validated server-side; relax explicit-any here only.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
