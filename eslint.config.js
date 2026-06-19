import js from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import boundaries from 'eslint-plugin-boundaries'
import jsdoc from 'eslint-plugin-jsdoc'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
// Only unicorn/filename-case is used — intentionally minimal, not loading full recommended suite.
import unicorn from 'eslint-plugin-unicorn'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'public/mockServiceWorker.js']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      react.configs.flat.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.strict,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      boundaries,
      unicorn,
      jsdoc,
    },
    settings: {
      react: { version: 'detect' },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**/*' },
        { type: 'pages', pattern: 'src/pages/**/*' },
        { type: 'widgets', pattern: 'src/widgets/**/*' },
        { type: 'features', pattern: 'src/features/**/*' },
        { type: 'entities', pattern: 'src/entities/**/*' },
        { type: 'shared', pattern: 'src/shared/**/*' },
      ],
      jsdoc: { mode: 'typescript' },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          rules: [
            {
              from: { type: 'app' },
              allow: { to: { type: ['pages', 'widgets', 'features', 'entities', 'shared'] } },
            },
            {
              from: { type: 'pages' },
              allow: { to: { type: ['widgets', 'features', 'entities', 'shared'] } },
            },
            {
              from: { type: 'widgets' },
              allow: { to: { type: ['features', 'entities', 'shared'] } },
            },
            {
              from: { type: 'features' },
              allow: { to: { type: ['entities', 'shared'] } },
            },
            {
              from: { type: 'entities' },
              allow: { to: { type: ['shared'] } },
            },
            {
              from: { type: 'shared' },
              allow: { to: { type: ['shared'] } },
            },
          ],
        },
      ],
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/no-multi-comp': ['error', { ignoreStateless: false }],
      'no-console': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@opentelemetry/*'],
              message:
                'Import OpenTelemetry only from src/shared/lib/telemetry to keep the browser bootstrap centralized.',
            },
          ],
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'ImportDeclaration[source.value=/^(?:\\.\\.\\/|\\.\\/|@\\/).+\\.(?:ts|tsx|js|jsx)$/]',
          message: 'Use extensionless local imports for TypeScript and JavaScript modules.',
        },
        {
          selector:
            'ExportAllDeclaration[source.value=/^(?:\\.\\.\\/|\\.\\/|@\\/).+\\.(?:ts|tsx|js|jsx)$/]',
          message: 'Use extensionless local re-exports for TypeScript and JavaScript modules.',
        },
        {
          selector:
            'ExportNamedDeclaration[source.value=/^(?:\\.\\.\\/|\\.\\/|@\\/).+\\.(?:ts|tsx|js|jsx)$/]',
          message: 'Use extensionless local re-exports for TypeScript and JavaScript modules.',
        },
        {
          selector:
            'ImportExpression[source.value=/^(?:\\.\\.\\/|\\.\\/|@\\/).+\\.(?:ts|tsx|js|jsx)$/]',
          message: 'Use extensionless dynamic imports for local TypeScript and JavaScript modules.',
        },
      ],
      'unicorn/filename-case': [
        'error',
        {
          cases: { pascalCase: true, camelCase: true },
          ignore: [/^[a-z]+\.config\.[jt]s$/, /^main\.tsx$/, /^vite-env\.d\.ts$/],
        },
      ],
      'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      'max-lines-per-function': ['warn', { max: 100 }],
      complexity: ['warn', 10],
      // JSDoc: require blocks on every exported symbol
      'jsdoc/require-jsdoc': [
        'warn',
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            ArrowFunctionExpression: false,
            FunctionExpression: false,
            MethodDefinition: false,
          },
          contexts: [
            'ExportNamedDeclaration > VariableDeclaration',
            'ExportNamedDeclaration > TSTypeAliasDeclaration',
            'ExportNamedDeclaration > TSInterfaceDeclaration',
          ],
        },
      ],
      'jsdoc/require-param': ['warn', { checkDestructured: false }],
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-returns': ['warn', { checkGetters: false }],
      'jsdoc/require-returns-description': 'warn',
      'jsdoc/check-param-names': ['warn', { checkDestructured: false }],
      'jsdoc/check-tag-names': ['warn', { definedTags: ['property'] }],
      'react/jsx-no-literals': [
        'warn',
        {
          noStrings: true,
          allowedStrings: [],
          ignoreProps: true,
          noAttributeStrings: false,
        },
      ],
      // Accessibility (WCAG 2.1 AA — required by EN 301 549 / BITV 2.0)
      'jsx-a11y/label-has-associated-control': ['error', { assert: 'either' }],
    },
  },
  // Test files may define inline wrapper components (e.g. makeWrapper) — not a code smell.
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      // Multiple inline wrapper components (e.g. makeWrapper) are a common test pattern.
      'react/no-multi-comp': 'off',
    },
  },
  // shadcn/ui primitives in src/shared/components are mechanical Radix wrappers:
  // multi-component files are expected here.
  {
    files: ['src/shared/components/**/*.{ts,tsx}'],
    rules: {
      'react/no-multi-comp': 'off',
    },
  },
  // OpenTelemetry bootstrap files are the only place allowed to import @opentelemetry directly.
  {
    files: ['src/shared/lib/telemetry/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  prettierConfig,
])
