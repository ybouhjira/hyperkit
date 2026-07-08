import { RuleTester } from '@typescript-eslint/rule-tester';
import * as vitest from 'vitest';
import * as tseslintParser from '@typescript-eslint/parser';
import rule from '../../src/rules/require-keyed-show';

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

ruleTester.run('require-keyed-show', rule, {
  valid: [
    {
      code: `<Show when={condition()} keyed>{(item) => <div>{item}</div>}</Show>`,
    },
    {
      code: `<Show when={isVisible()}><div>Static content</div></Show>`,
    },
    {
      code: `<Show when={condition()} keyed={true}>{(item) => <div/>}</Show>`,
    },
    {
      code: `<Show when={data()}>{() => <div>No parameter</div>}</Show>`,
    },
    {
      code: `<Show when={value} keyed>{(v) => <span>{v}</span>}</Show>`,
    },
    {
      code: `<Show when={test()}><p>Just text</p></Show>`,
    },
  ],
  invalid: [
    {
      code: `<Show when={condition()}>{(item) => <div>{item}</div>}</Show>`,
      errors: [
        {
          messageId: 'requireKeyed',
        },
      ],
    },
    {
      code: `<Show when={data()}>{(d) => <span>{d.name}</span>}</Show>`,
      errors: [
        {
          messageId: 'requireKeyed',
        },
      ],
    },
    {
      code: `<Show when={signal()}>{(s) => <>{s}</>}</Show>`,
      errors: [
        {
          messageId: 'requireKeyed',
        },
      ],
    },
    {
      code: `<Show when={getValue()}>{function(val) { return <div>{val}</div>; }}</Show>`,
      errors: [
        {
          messageId: 'requireKeyed',
        },
      ],
    },
    {
      code: `<Show when={computed()}>{(x) => <span>{x.id}</span>}</Show>`,
      errors: [
        {
          messageId: 'requireKeyed',
        },
      ],
    },
    {
      code: `<Show when={resource()}>{(r) => <div>{r.data}</div>}</Show>`,
      errors: [
        {
          messageId: 'requireKeyed',
        },
      ],
    },
  ],
});
