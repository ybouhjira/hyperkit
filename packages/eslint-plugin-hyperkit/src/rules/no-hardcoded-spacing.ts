import { ESLintUtils, TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/ybouhjira/hyperkit/blob/main/docs/eslint-rules/${name}.md`
);

const SPACING_PROPERTIES = new Set([
  'padding',
  'paddingTop',
  'padding-top',
  'paddingBottom',
  'padding-bottom',
  'paddingLeft',
  'padding-left',
  'paddingRight',
  'padding-right',
  'margin',
  'marginTop',
  'margin-top',
  'marginBottom',
  'margin-bottom',
  'marginLeft',
  'margin-left',
  'marginRight',
  'margin-right',
  'gap',
  'rowGap',
  'row-gap',
  'columnGap',
  'column-gap',
]);

const ALLOWED_VALUES = new Set(['0', '0px', 'auto', 'inherit', 'unset', 'initial']);

const isHardcodedSpacing = (value: string): boolean => {
  // Allow CSS variables
  if (value.startsWith('var(')) {
    return false;
  }

  // Allow special values
  if (ALLOWED_VALUES.has(value)) {
    return false;
  }

  // Check for hardcoded spacing (16px, 1rem, etc.)
  // Also handle compound values like "8px 16px"
  const parts = value.split(/\s+/);
  for (const part of parts) {
    if (/^\d+(\.\d+)?(px|rem|em)$/.test(part)) {
      return true;
    }
  }

  return false;
};

const getPropertyKey = (
  property: TSESTree.Property
): string | null => {
  if (property.key.type === AST_NODE_TYPES.Identifier) {
    return property.key.name;
  }
  if (property.key.type === AST_NODE_TYPES.Literal && typeof property.key.value === 'string') {
    return property.key.value;
  }
  return null;
};

export default createRule({
  name: 'no-hardcoded-spacing',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hardcoded spacing values in JSX inline styles',
      recommended: 'recommended',
    },
    messages: {
      hardcodedSpacing:
        "Hardcoded spacing '{{value}}' in '{{prop}}'. Consider using a SolidKit space token via var(--sk-space-*).",
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

          const propKey = getPropertyKey(property);
          if (!propKey || !SPACING_PROPERTIES.has(propKey)) {
            continue;
          }

          if (
            property.value.type === AST_NODE_TYPES.Literal &&
            typeof property.value.value === 'string'
          ) {
            const value = property.value.value;
            if (isHardcodedSpacing(value)) {
              context.report({
                node: property.value,
                messageId: 'hardcodedSpacing',
                data: {
                  value,
                  prop: propKey,
                },
              });
            }
          }
        }
      },
    };
  },
});
