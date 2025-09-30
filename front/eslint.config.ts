import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { Linter } from 'eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginImport from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = dirname(__filename);

const compat: FlatCompat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
});

const config: Linter.Config[] = [
  // Global ignores
  {
    ignores: [
      '**/.next/**',
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/.pnpm-store/**',
      '**/build/**',
      '**/__tests__/**',
      '**/test/**',
      'playwright.config.ts',
      'vitest.config.ts',
      'next.config.ts',
      'postcss.config.js',
      '**/.cache/**'
    ]
  },

  // Base JavaScript configuration
  js.configs.recommended,

  // Next.js configuration using FlatCompat for legacy config
  ...compat.extends('next/core-web-vitals'),

  // Type-aware TypeScript configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname
      }
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks
    },
    rules: {
      // Include ALL typescript-eslint type-checking rules
      ...tseslint.configs.recommendedTypeChecked[1]?.rules,
      ...tseslint.configs.strictTypeChecked[1]?.rules
    }
  },

  // TypeScript rules - Enforce fail fast and strict linting
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'no-unused-vars': 'off', // Turn off base rule in favor of TypeScript version
      '@typescript-eslint/no-unused-vars': [
        warnInDevModeErrorInProd(),
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_'
        }
      ],
      'no-console': warnInDevModeErrorInProd(),

      // TypeScript Best Practices - Strict Type Policy
      '@typescript-eslint/no-explicit-any': 'error', // Forbid any
      '@typescript-eslint/no-unsafe-assignment': 'error', // Forbid any assignments
      '@typescript-eslint/no-unsafe-member-access': 'error', // Forbid any.property
      '@typescript-eslint/no-unsafe-call': 'error', // Forbid any()
      '@typescript-eslint/no-unsafe-return': 'error', // Forbid returning any
      '@typescript-eslint/no-unsafe-argument': 'error', // Forbid any as argument

      // Additional type safety
      'prefer-const': 'error',

      // Tier 1 bool safety: Core Comparison & Casting Safety (High Impact)
      eqeqeq: 'error', // Force === instead of ==
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: true, // Allow obj && obj.method()
          allowNullableBoolean: true,
          allowNullableString: false,
          allowNullableNumber: false,
          allowAny: false
        }
      ],
      '@typescript-eslint/no-non-null-assertion': 'error', // Forbid dangerous ! operator
      '@typescript-eslint/prefer-nullish-coalescing': 'error', // Use ?? instead of ||

      // Tier 2 bool safety: High Value Safety & Readability Rules
      '@typescript-eslint/prefer-optional-chain': 'error', // Use ?. instead of && chains
      '@typescript-eslint/no-unnecessary-type-assertion': 'error', // Remove redundant assertions
      '@typescript-eslint/switch-exhaustiveness-check': 'error', // Ensure switch completeness
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'as',
          objectLiteralTypeAssertions: 'never'
        }
      ],
      '@typescript-eslint/prefer-as-const': 'error', // Use as const for literals
      '@typescript-eslint/no-unnecessary-condition': 'error', // Allows to catch incorrect type checks

      // Forbid vague types in favor of explicit types
      '@typescript-eslint/ban-ts-comment': 'error',
      '@typescript-eslint/no-empty-object-type': 'error', // Forbid {} - use Record<string, unknown> instead
      '@typescript-eslint/prefer-function-type': 'error', // Prefer function types over interfaces with call signatures
      '@typescript-eslint/no-wrapper-object-types': 'error', // Forbid Object, Boolean, Number, String, Symbol
      '@typescript-eslint/no-unsafe-function-type': 'error', // Forbid Function - use specific signatures instead
      // Ban the 'object' type using the no-restricted-types rule
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            object: {
              message:
                'Use Record<string, unknown> or a specific interface instead of object',
              fixWith: 'Record<string, unknown>',
              suggest: [
                'Record<string, unknown>',
                'Record<string, any>',
                'Record<PropertyKey, unknown>'
              ]
            }
          }
        }
      ],

      // Explicit return types - enforced for non-obvious cases only
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true, // Allow arrow functions as expressions (type inferred)
          allowTypedFunctionExpressions: true, // Allow when function type already specified
          allowHigherOrderFunctions: true, // Allow functions returning functions
          allowDirectConstAssertionInArrowFunctions: true, // Allow `() => value as const`
          allowConciseArrowFunctionExpressionsStartingWithVoid: true, // Allow `() => void expression`
          allowFunctionsWithoutTypeParameters: true, // Allow simple functions with obvious returns
          allowedNames: [], // No function name exceptions
          allowIIFEs: true // Allow immediately invoked function expressions
        }
      ]
    }
  },

  // React/JSX specific rules
  {
    files: ['**/*.tsx', '**/*.jsx'],
    rules: {
      // React hooks rules (these come from next/core-web-vitals)
      'react-hooks/exhaustive-deps': 'error',
      'react-hooks/rules-of-hooks': 'error'
    }
  },

  // Imports
  {
    plugins: { import: pluginImport },
    settings: {
      'import/resolver': {
        typescript: true,
        node: true
      }
    },
    rules: {
      'import/first': warnInDevModeErrorInProd(),
      'import/newline-after-import': warnInDevModeErrorInProd(),
      'import/no-duplicates': 'off', // to avoid potential false positives
      // organize imports into groups
      'import/order': [
        warnInDevModeErrorInProd(),
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index'],
            'type'
          ],
          pathGroups: [
            { pattern: '@/**', group: 'internal', position: 'before' }
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          warnOnUnassignedImports: true
        }
      ]
    }
  },

  // Remove unused imports automatically with --fix
  {
    rules: {
      'unused-imports/no-unused-imports': warnInDevModeErrorInProd(),
      'unused-imports/no-unused-vars': 'off'
    },
    plugins: {
      'unused-imports': unusedImports
    }
  },

  // Disable stylistic rules so Prettier owns formatting
  {
    rules: {
      ...eslintConfigPrettier.rules
    }
  },

  // Relaxed rules for shadcn/ui and template-provided components
  {
    files: [
      'src/components/ui/**/*', // shadcn/ui components
      'src/components/kbar/**/*' // kbar library components
    ],
    rules: {
      // Unsafe/any and other strict rules
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',

      // New comparison/casting safety rule exemptions
      eqeqeq: 'off',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/switch-exhaustiveness-check': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/prefer-as-const': 'off',

      // Vague type rule exemptions
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/prefer-function-type': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-restricted-types': 'off'
    }
  }
];

function warnInDevModeErrorInProd(): 'warn' | 'error' {
  return process.env.NODE_ENV === 'development' ? 'warn' : 'error';
}

export default config;
