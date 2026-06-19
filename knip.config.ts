import type { KnipConfig } from 'knip'

const config: KnipConfig = {
  entry: ['src/main.tsx'],
  project: ['src/**/*.{ts,tsx}'],
  ignore: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}', 'e2e/**'],
  ignoreDependencies: [
    // Used via CLI / Vite plugin, not direct imports
    'tailwindcss',
    '@tailwindcss/vite',
    // Prettier plugins loaded by prettier config, not imported
    '@ianvs/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
    // Playwright is invoked via CLI
    '@playwright/test',
    '@axe-core/playwright',
    // Type packages — referenced via tsconfig, not imports
    '@types/node',
    '@types/react',
    '@types/react-dom',
    // MSW service worker setup via CLI
    'msw',
    // stylelint used via CLI in lint script
    'stylelint',
    // shadcn CLI
    'shadcn',
    // used via npm scripts, not imported
    'license-checker-rseidelsohn',
  ],
}

export default config
