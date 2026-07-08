import { ESLintUtils, TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/ybouhjira/hyperkit/blob/main/docs/eslint-rules/${name}.md`
);

export default createRule({
  name: 'no-important',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow !important in JSX inline styles',
      recommended: 'recommended',
    },
    messages: {
      noImportant:
        'Avoid !important in component styles. Use CSS variable scoping or specificity to override styles.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      JSXAttribute(node) {
        if (
          node.name.type !== AST_NODE_TYPES.JSXIdentifier ||
          node.name.name !== 'style'
        ) {
          return;
        }

        if (
          !node.value ||
          node.value.type !== AST_NODE_TYPES.JSXExpressionContainer
        ) {
          return;
        }

        const expression = node.value.expression;
        if (
          expression.type !== AST_NODE_TYPES.ObjectExpression ||
          expression.type === AST_NODE_TYPES.JSXEmptyExpression
        ) {
          return;
        }

        for (const property of expression.properties) {
          if (property.type !== AST_NODE_TYPES.Property) {
            continue;
          }

          if (
            property.value.type === AST_NODE_TYPES.Literal &&
            typeof property.value.value === 'string' &&
            property.value.value.includes('!important')
          ) {
            context.report({
              node: property.value,
              messageId: 'noImportant',
            });
          }
        }
      },
    };
  },
});
