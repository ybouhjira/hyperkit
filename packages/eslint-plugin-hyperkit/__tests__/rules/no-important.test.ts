import { RuleTester } from '@typescript-eslint/rule-tester';
import * as vitest from 'vitest';
import * as tseslintParser from '@typescript-eslint/parser';
import rule from '../../src/rules/no-important';

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

ruleTester.run('no-important', rule, {
  valid: [
    {
      code: `<div style={{ color: 'var(--sk-text-primary)' }} />`,
    },
    {
      code: `<div style={{ fontSize: '14px' }} />`,
    },
    {
      code: `<div style={{ display: 'flex' }} />`,
    },
    {
      code: `<div style={{ margin: '0' }} />`,
    },
  ],
  invalid: [
    {
      code: `<div style={{ color: 'red !important' }} />`,
      errors: [
        {
          messageId: 'noImportant',
        },
      ],
    },
    {
      code: `<div style={{ display: 'none !important' }} />`,
      errors: [
        {
          messageId: 'noImportant',
        },
      ],
    },
    {
      code: `<div style={{ fontSize: '16px !important' }} />`,
      errors: [
        {
          messageId: 'noImportant',
        },
      ],
    },
    {
      code: `<div style={{ padding: '8px!important' }} />`,
      errors: [
        {
          messageId: 'noImportant',
        },
      ],
    },
  ],
});
