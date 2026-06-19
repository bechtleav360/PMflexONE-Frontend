/**
 * i18next-scanner configuration.
 *
 * Scans all TypeScript/TSX source files (excluding test files) for i18n key
 * usages and writes the collected keys back to the locale JSON files.
 *
 * Run via:
 *   pnpm i18n:scan          — update locale files in-place
 *   pnpm i18n:check-missing — fail if any used key is absent or empty (CI gate)
 *   pnpm i18n:check-unused  — fail if any locale key is unreferenced (CI gate)
 *
 * Design notes:
 * - Single namespace ("translation") matching the i18next init in
 *   src/shared/lib/i18n/i18n.ts.
 * - keySeparator "." matches the nested JSON structure used in the locale files.
 * - nsSeparator false because no namespace prefix appears in any t() call.
 * - Keys found in source but missing from JSON are added with an empty string
 *   value so they are visible as gaps without overwriting existing translations.
 * - Keys present in JSON but absent from source are retained by i18n:scan;
 *   run i18n:fix-unused separately to remove them.
 *
 * Note: this file uses CommonJS syntax (.cjs) because the i18next-scanner CLI
 * loads config via require() and the project root has "type": "module".
 */

module.exports = {
  input: [
    'src/**/*.{ts,tsx}',
    // Exclude test files — fixture keys are not real translation keys.
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/*.test-utils.{ts,tsx}',
  ],

  output: './',

  options: {
    // ------------------------------------------------------------------ //
    // Namespace & key structure
    // ------------------------------------------------------------------ //
    // Matches i18n.ts: resources are registered under the "translation" key.
    defaultNs: 'translation',
    // No namespace prefix in t() calls (useTranslation() without arguments).
    nsSeparator: false,
    // Nested keys separated by "." matching the locale JSON structure.
    keySeparator: '.',

    // ------------------------------------------------------------------ //
    // Locale output
    // ------------------------------------------------------------------ //
    lngs: ['de', 'en'],
    defaultValue: '',
    resource: {
      loadPath: 'src/shared/lib/i18n/locales/{{lng}}.json',
      savePath: 'src/shared/lib/i18n/locales/{{lng}}.json',
      jsonIndent: 2,
      lineEnding: '\n',
    },

    // Keep keys sorted so diffs stay readable and deterministic.
    sort: true,

    // ------------------------------------------------------------------ //
    // Translation function detection
    // ------------------------------------------------------------------ //
    func: {
      list: ['t', 'i18next.t', 'i18n.t'],
      extensions: ['.ts', '.tsx'],
    },

    // <Trans> component is not used in this codebase. Scanning is disabled because
    // the acorn-based JSX parser cannot handle TypeScript syntax in .tsx files.
    // If <Trans> is added, install @babel/core + @babel/preset-typescript and add
    // a custom transform that strips TS types before parseTransFromString runs.
    trans: {
      component: 'Trans',
      i18nKey: 'i18nKey',
      defaultsKey: 'defaults',
      extensions: [],
      fallbackKey: false,
      supportBasicHtmlNodes: true,
      keepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
      acorn: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },

    // ------------------------------------------------------------------ //
    // Plural handling
    // ------------------------------------------------------------------ //
    // i18next uses "_one" / "_other" suffixes (e.g. "packageCount_one").
    pluralSeparator: '_',

    // ------------------------------------------------------------------ //
    // Interpolation
    // ------------------------------------------------------------------ //
    interpolation: {
      prefix: '{{',
      suffix: '}}',
    },
  },
}
