import { ESLintUtils, TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/ybouhjira/hyperkit/blob/main/docs/eslint-rules/${name}.md`
);

const FONT_SIZE_PROPERTIES = new Set(['fontSize', 'font-size']);

const ALLOWED_VALUES = new Set([
  'inherit',
  'unset',
  'initial',
  'smaller',
  'larger',
  'xx-small',
  'x-small',
  'small',
  'medium',
  'large',
  'x-large',
  'xx-large',
]);

const SIZE_SUGGESTIONS: Record<string, string> = {
  '12px': 'var(--sk-font-size-xs)',
  '14px': 'var(--sk-font-size-sm)',
  '16px': 'var(--sk-font-size-base)',
  '18px': 'var(--sk-font-size-lg)',
  '20px': 'var(--sk-font-size-xl)',
  '24px': 'var(--sk-font-size-2xl)',
};

const isHardcodedFontSize = (value: string): boolean => {
  // Allow CSS variables
  if (value.startsWith('var(')) {
    return false;
  }

  // Allow special values
  if (ALLOWED_VALUES.has(value)) {
    return false;
  }

  // Check for hardcoded sizes (14px, 1.2rem, 16pt, etc.)
  if (/^\d+(\.\d+)?(px|rem|em|pt)$/.test(value)) {
    return true;
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
  name: 'no-hardcoded-font-size',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hardcoded font sizes in JSX inline styles',
      recommended: 'recommended',
    },
    messages: {
      hardcodedFontSize:
        "Hardcoded font size '{{value}}'. Use a SolidKit theme variable like var(--sk-font-size-base) or var(--sk-font-size-sm).{{suggestion}}",
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
          if (!propKey || !FONT_SIZE_PROPERTIES.has(propKey)) {
            continue;
          }

          if (
            property.value.type === AST_NODE_TYPES.Literal &&
            typeof property.value.value === 'string'
          ) {
            const value = property.value.value;
            if (isHardcodedFontSize(value)) {
              const suggestion = SIZE_SUGGESTIONS[value]
                ? ` Consider: ${SIZE_SUGGESTIONS[value]}`
                : '';

              context.report({
                node: property.value,
                messageId: 'hardcodedFontSize',
                data: {
                  value,
                  suggestion,
                },
              });
            }
          }
        }
      },
    };
  },
});
