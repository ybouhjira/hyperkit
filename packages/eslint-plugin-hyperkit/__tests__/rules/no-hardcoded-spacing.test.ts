import { RuleTester } from '@typescript-eslint/rule-tester';
import * as vitest from 'vitest';
import * as tseslintParser from '@typescript-eslint/parser';
import rule from '../../src/rules/no-hardcoded-spacing';

RuleTester.afterAll = vitest.afterAll;
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
RuleTester.describe = vitest.describe;

const ruleTester = new RuleTester({
  languageOptions: {
    parser: tseslintParser,
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
});

ruleTester.run('no-hardcoded-spacing', rule, {
  valid: [
    {
      code: `<div style={{ padding: 'var(--sk-space-md)' }} />`,
    },
    {
      code: `<div style={{ margin: '0' }} />`,
    },
    {
      code: `<div style={{ padding: 'auto' }} />`,
    },
    {
      code: `<div style={{ margin: '0px' }} />`,
    },
    {
      code: `<div style={{ padding: 'var(--sk-space-lg)' }} />`,
    },
    {
      code: `<div style={{ gap: 'inherit' }} />`,
    },
  ],
  invalid: [
    {
      code: `<div style={{ padding: '16px' }} />`,
      errors: [
        {
          messageId: 'hardcodedSpacing',
          data: {
            value: '16px',
            prop: 'padding',
          },
        },
      ],
    },
    {
      code: `<div style={{ margin: '8px 16px' }} />`,
      errors: [
        {
          messageId: 'hardcodedSpacing',
          data: {
            value: '8px 16px',
            prop: 'margin',
          },
        },
      ],
    },
    {
      code: `<div style={{ gap: '1rem' }} />`,
      errors: [
        {
          messageId: 'hardcodedSpacing',
          data: {
            value: '1rem',
            prop: 'gap',
          },
        },
      ],
    },
    {
      code: `<div style={{ paddingTop: '12px' }} />`,
      errors: [
        {
          messageId: 'hardcodedSpacing',
          data: {
            value: '12px',
            prop: 'paddingTop',
          },
        },
      ],
    },
    {
      code: `<div style={{ 'margin-left': '2em' }} />`,
      errors: [
        {
          messageId: 'hardcodedSpacing',
          data: {
            value: '2em',
            prop: 'margin-left',
          },
        },
      ],
    },
    {
      code: `<div style={{ rowGap: '8px' }} />`,
      errors: [
        {
          messageId: 'hardcodedSpacing',
          data: {
            value: '8px',
            prop: 'rowGap',
          },
        },
      ],
    },
  ],
});
