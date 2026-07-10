import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import tsparser from '@typescript-eslint/parser';
import solid from 'eslint-plugin-solid';
import prettier from 'eslint-plugin-prettier';
import hyperkit from './packages/eslint-plugin-hyperkit/dist/index.js';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  // Ignore patterns
  {
    ignores: ['dist/**', 'cli/dist/**', 'node_modules/**', '.storybook/**', 'coverage/**', 'storybook-static/**'],
  },

  // Base ESLint recommended rules
  eslint.configs.recommended,

  // TypeScript files configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      hyperkit,
      '@typescript-eslint': tseslint.plugin,
      solid: solid,
      prettier: prettier,
    },
    rules: {
      // HyperKit design-token discipline — the library enforces its own plugin.
      // Scope: component source only (tests/stories may use literals as fixtures).
      'hyperkit/no-hardcoded-colors': 'error',
      'hyperkit/no-hardcoded-spacing': 'error',
      'hyperkit/no-hardcoded-font-size': 'error',
      'hyperkit/no-important': 'error',

      // TypeScript rules - basic
      ...(tseslint.configs.recommended.find(c => c.rules && '@typescript-eslint/no-unused-vars' in c.rules)?.rules ?? {}),
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',

      // TypeScript rules - type-checked
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: true,
          allowNumber: false,
          allowNullableObject: true,
          allowNullableBoolean: true,
          allowNullableString: true,
          allowNullableNumber: false,
          allowNullableEnum: false,
          allowAny: false,
        },
      ],

      // SolidJS rules
      ...solid.configs.recommended.rules,
      'solid/reactivity': 'error',
      'solid/no-destructure': 'error',
      'solid/jsx-no-undef': 'error',
      'solid/no-innerhtml': 'error',
      'solid/prefer-for': 'error',

      // Prettier integration
      ...prettierConfig.rules,
      'prettier/prettier': 'error',

      // General rules - disable no-undef for TS (TypeScript handles this better)
      'no-undef': 'off',
      'no-console': 'error',
      'no-debugger': 'error',
      'no-redeclare': 'off', // TS handles this; base rule conflicts with TS overloads/namespaces
      'require-yield': 'error',
    },
  },

  // Test files - relaxed rules
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'solid/reactivity': 'off',
      'hyperkit/no-hardcoded-colors': 'off',
      'hyperkit/no-hardcoded-spacing': 'off',
      'hyperkit/no-hardcoded-font-size': 'off',
    },
  },

  // MessageBubble intentionally uses innerHTML for sanitized markdown rendering
  {
    files: ['src/composites/MessageBubble/MessageBubble.tsx'],
    rules: {
      'solid/no-innerhtml': 'off',
    },
  },

  // PanelContainer passes initial config to usePanelLayout at setup time
  {
    files: ['src/panels/PanelContainer.tsx'],
    rules: {
      'solid/reactivity': 'off',
    },
  },

  // Story files and demo mockups - relaxed rules
  {
    files: ['**/*.stories.tsx', 'src/stories/**'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      'solid/reactivity': 'off',
      'solid/prefer-for': 'off',
      'solid/components-return-once': 'off',
      'hyperkit/no-hardcoded-colors': 'off',
      'hyperkit/no-hardcoded-spacing': 'off',
      'hyperkit/no-hardcoded-font-size': 'off',
    },
  },

  // JavaScript files (if any)
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      prettier: prettier,
    },
    rules: {
      ...prettierConfig.rules,
      'prettier/prettier': 'error',
      'no-console': 'error',
      'no-debugger': 'error',
    },
  },
];
