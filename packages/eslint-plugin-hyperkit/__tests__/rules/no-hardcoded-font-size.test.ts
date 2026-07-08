import { RuleTester } from '@typescript-eslint/rule-tester';
import * as vitest from 'vitest';
import * as tseslintParser from '@typescript-eslint/parser';
import rule from '../../src/rules/no-hardcoded-font-size';

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

ruleTester.run('no-hardcoded-font-size', rule, {
  valid: [
    {
      code: `<div style={{ fontSize: 'var(--sk-font-size-base)' }} />`,
    },
    {
      code: `<div style={{ fontSize: 'inherit' }} />`,
    },
    {
      code: `<div style={{ fontSize: 'larger' }} />`,
    },
    {
      code: `<div style={{ fontSize: 'var(--sk-font-size-sm)' }} />`,
    },
    {
      code: `<div style={{ fontSize: 'medium' }} />`,
    },
    {
      code: `<div style={{ fontSize: 'xx-large' }} />`,
    },
  ],
  invalid: [
    {
      code: `<div style={{ fontSize: '14px' }} />`,
      errors: [
        {
          messageId: 'hardcodedFontSize',
          data: {
            value: '14px',
            suggestion: ' Consider: var(--sk-font-size-sm)',
          },
        },
      ],
    },
    {
      code: `<div style={{ fontSize: '1.2rem' }} />`,
      errors: [
        {
          messageId: 'hardcodedFontSize',
          data: {
            value: '1.2rem',
            suggestion: '',
          },
        },
      ],
    },
    {
      code: `<div style={{ 'font-size': '16pt' }} />`,
      errors: [
        {
          messageId: 'hardcodedFontSize',
          data: {
            value: '16pt',
            suggestion: '',
          },
        },
      ],
    },
    {
      code: `<div style={{ fontSize: '12px' }} />`,
      errors: [
        {
          messageId: 'hardcodedFontSize',
          data: {
            value: '12px',
            suggestion: ' Consider: var(--sk-font-size-xs)',
          },
        },
      ],
    },
    {
      code: `<div style={{ fontSize: '20px' }} />`,
      errors: [
        {
          messageId: 'hardcodedFontSize',
          data: {
            value: '20px',
            suggestion: ' Consider: var(--sk-font-size-xl)',
          },
        },
      ],
    },
    {
      code: `<div style={{ fontSize: '2em' }} />`,
      errors: [
        {
          messageId: 'hardcodedFontSize',
          data: {
            value: '2em',
            suggestion: '',
          },
        },
      ],
    },
  ],
});
