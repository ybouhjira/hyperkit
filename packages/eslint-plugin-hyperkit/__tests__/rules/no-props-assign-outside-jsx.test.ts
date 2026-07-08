import { RuleTester } from '@typescript-eslint/rule-tester';
import * as vitest from 'vitest';
import * as tseslintParser from '@typescript-eslint/parser';
import rule from '../../src/rules/no-props-assign-outside-jsx';

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

ruleTester.run('no-props-assign-outside-jsx', rule, {
  valid: [
    {
      code: `function Comp(props) { const x = () => props.foo; return <div/> }`,
    },
    {
      code: `function Comp(props) { return <div>{props.foo}</div> }`,
    },
    {
      code: `function Comp(props) { createMemo(() => props.foo); return <div/> }`,
    },
    {
      code: `function Comp(props) { createEffect(() => { const x = props.foo }); return <div/> }`,
    },
    {
      code: `const Comp = (props) => <div>{props.foo}</div>`,
    },
    {
      code: `function Comp(props) { const getter = () => props.value; return <div>{getter()}</div> }`,
    },
    {
      code: `function Comp(props) { const memo = createMemo(() => props.foo || props.bar); return <div/> }`,
    },
    {
      code: `function notComponent(props) { const x = props.foo; return "string"; }`,
    },
  ],
  invalid: [
    {
      code: `function Comp(props) { const x = props.foo; return <div/> }`,
      errors: [
        {
          messageId: 'noPropsAssign',
          data: {
            prop: 'foo',
            name: 'x',
          },
        },
      ],
    },
    {
      code: `function Comp(props) { const x = props.foo || props.bar; return <div/> }`,
      errors: [
        {
          messageId: 'noPropsAssign',
          data: {
            prop: 'foo',
            name: 'x',
          },
        },
        {
          messageId: 'noPropsAssign',
          data: {
            prop: 'bar',
            name: 'x',
          },
        },
      ],
    },
    {
      code: `function Comp(props) { const x = props.foo ?? 'default'; return <div/> }`,
      errors: [
        {
          messageId: 'noPropsAssign',
          data: {
            prop: 'foo',
            name: 'x',
          },
        },
      ],
    },
    {
      code: `const Comp = (props) => { const val = props.count; return <div>{val}</div> }`,
      errors: [
        {
          messageId: 'noPropsAssign',
          data: {
            prop: 'count',
            name: 'val',
          },
        },
      ],
    },
    {
      code: `function Comp(props) { const { foo, bar } = props; return <div/> }`,
      errors: [
        {
          messageId: 'noPropsDestructure',
          data: {
            prop: 'foo',
            name: 'foo',
          },
        },
        {
          messageId: 'noPropsDestructure',
          data: {
            prop: 'bar',
            name: 'bar',
          },
        },
      ],
    },
    {
      code: `function Comp(props) { const { name: userName } = props; return <div/> }`,
      errors: [
        {
          messageId: 'noPropsDestructure',
          data: {
            prop: 'name',
            name: 'userName',
          },
        },
      ],
    },
    {
      code: `const Comp = (props) => { const title = props.title; return <h1>{title}</h1> }`,
      errors: [
        {
          messageId: 'noPropsAssign',
          data: {
            prop: 'title',
            name: 'title',
          },
        },
      ],
    },
  ],
});
