import { RuleTester } from '@typescript-eslint/rule-tester';
import * as vitest from 'vitest';
import * as tseslintParser from '@typescript-eslint/parser';
import rule from '../../src/rules/no-hardcoded-colors';

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

ruleTester.run('no-hardcoded-colors', rule, {
  valid: [
    {
      code: `<div style={{ color: 'var(--sk-text-primary)' }} />`,
    },
    {
      code: `<div style={{ backgroundColor: 'transparent' }} />`,
    },
    {
      code: `<div style={{ color: 'inherit' }} />`,
    },
    {
      code: `<div style={{ color: 'currentColor' }} />`,
    },
    {
      code: `<div style={{ width: '100px' }} />`,
    },
    {
      code: `<div style={{ color: 'var(--custom-color)' }} />`,
    },
    {
      code: `<div style={{ background: 'none' }} />`,
    },
    {
      code: `<div style={{ borderColor: 'unset' }} />`,
    },
  ],
  invalid: [
    {
      code: `<div style={{ color: '#fff' }} />`,
      errors: [
        {
          messageId: 'hardcodedColor',
          data: {
            value: '#fff',
            prop: 'color',
          },
        },
      ],
    },
    {
      code: `<div style={{ backgroundColor: 'rgb(255, 0, 0)' }} />`,
      errors: [
        {
          messageId: 'hardcodedColor',
          data: {
            value: 'rgb(255, 0, 0)',
            prop: 'backgroundColor',
          },
        },
      ],
    },
    {
      code: `<div style={{ borderColor: 'red' }} />`,
      errors: [
        {
          messageId: 'hardcodedColor',
          data: {
            value: 'red',
            prop: 'borderColor',
          },
        },
      ],
    },
    {
      code: `<div style={{ color: '#ffffff80' }} />`,
      errors: [
        {
          messageId: 'hardcodedColor',
          data: {
            value: '#ffffff80',
            prop: 'color',
          },
        },
      ],
    },
    {
      code: `<div style={{ fill: 'hsl(120, 100%, 50%)' }} />`,
      errors: [
        {
          messageId: 'hardcodedColor',
          data: {
            value: 'hsl(120, 100%, 50%)',
            prop: 'fill',
          },
        },
      ],
    },
    {
      code: `<div style={{ 'border-color': 'blue' }} />`,
      errors: [
        {
          messageId: 'hardcodedColor',
          data: {
            value: 'blue',
            prop: 'border-color',
          },
        },
      ],
    },
    {
      code: `<div style={{ stroke: '#ff0000' }} />`,
      errors: [
        {
          messageId: 'hardcodedColor',
          data: {
            value: '#ff0000',
            prop: 'stroke',
          },
        },
      ],
    },
    {
      code: `<div style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} />`,
      errors: [
        {
          messageId: 'hardcodedColor',
          data: {
            value: 'rgba(0, 0, 0, 0.5)',
            prop: 'backgroundColor',
          },
        },
      ],
    },
  ],
});
