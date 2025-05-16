// eslint.config.cjs
const { FlatCompat } = require('@eslint/eslintrc');
const js               = require('@eslint/js');
const tsParser         = require('@typescript-eslint/parser');
const tsPlugin         = require('@typescript-eslint/eslint-plugin');
const nodePlugin       = require('eslint-plugin-node');
const importPlugin     = require('eslint-plugin-import');

// FlatCompat needs the recommended ESLint config injected
const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  // Convert legacy shareable configs into flat blocks:
  ...compat.extends(
    'eslint:recommended',
    'plugin:node/recommended-module',      // ESM-aware Node rules
    'plugin:@typescript-eslint/recommended'
  ),

  // Apply to all TypeScript files
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,                    // actual parser object
      parserOptions: {
        project: ['./tsconfig.json'],      // enables type-aware linting
        sourceType: 'module',
        ecmaVersion: 2021,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      node:               nodePlugin,
      import:             importPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", {
        "args": "all",
        "argsIgnorePattern": "^_"
      }],
      // Disable Node plugin's own missing-import check
      'node/no-missing-import': 'off',
      // Use import plugin to catch unresolved modules
      'import/no-unresolved': ['error', { commonjs: true, amd: true }],

      //Turn off explicit any or require concrete types
      '@typescript-eslint/no-explicit-any': 'off',
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json'
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      }
    }
  }
];
