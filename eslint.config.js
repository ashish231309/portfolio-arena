import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

/**
 * Flat ESLint config. `npm run lint` — run it after touching src/ or qa/.
 *
 * Scope: catch real mistakes (undefined globals, unused code, hook misuse).
 * Formatting is Prettier's job (`npm run format`); this config deliberately
 * carries no stylistic rules so lint output stays signal.
 */
export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'audit/**',
      'public/**',
      'qa/screens/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,

  // App code: browser globals + JSX + React rules.
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      'react-hooks/rules-of-hooks': 'error',
      // U30: missing dependencies must fail lint — a warning that doesn't break
      // the build ships silent effect bugs.
      'react-hooks/exhaustive-deps': 'error',
      // This codebase is plain JSX by design (no TypeScript, no prop-types).
      'react/prop-types': 'off',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
    },
  },

  // Build config, QA scripts and tests: Node globals (plus browser globals for
  // the bits that run inside page.evaluate()).
  {
    files: [
      '*.config.{js,mjs}',
      'eslint.config.js',
      'qa/**/*.mjs',
      'tests/**/*.js',
    ],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' }],
    },
  },
]
