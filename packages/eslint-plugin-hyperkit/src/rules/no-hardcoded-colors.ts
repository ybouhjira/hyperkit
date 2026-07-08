import { ESLintUtils, TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/ybouhjira/hyperkit/blob/main/docs/eslint-rules/${name}.md`
);

const COLOR_PROPERTIES = new Set([
  'color',
  'backgroundColor',
  'background-color',
  'background',
  'borderColor',
  'border-color',
  'borderTopColor',
  'border-top-color',
  'borderBottomColor',
  'border-bottom-color',
  'borderLeftColor',
  'border-left-color',
  'borderRightColor',
  'border-right-color',
  'fill',
  'stroke',
  'outlineColor',
  'outline-color',
  'textDecorationColor',
  'text-decoration-color',
  'caretColor',
  'caret-color',
  'columnRuleColor',
  'column-rule-color',
]);

const NAMED_COLORS = new Set([
  'red',
  'blue',
  'green',
  'white',
  'black',
  'yellow',
  'orange',
  'purple',
  'pink',
  'gray',
  'grey',
  'brown',
  'cyan',
  'magenta',
  'lime',
  'navy',
  'teal',
  'maroon',
  'olive',
  'silver',
  'aqua',
  'fuchsia',
  'coral',
  'salmon',
  'tomato',
  'gold',
  'indigo',
  'violet',
  'crimson',
  'khaki',
  'plum',
  'orchid',
  'sienna',
]);

const ALLOWED_VALUES = new Set([
  'inherit',
  'currentColor',
  'transparent',
  'none',
  'unset',
  'initial',
]);

const isHardcodedColor = (value: string): boolean => {
  // Allow CSS variables
  if (value.startsWith('var(')) {
    return false;
  }

  // Allow special values
  if (ALLOWED_VALUES.has(value)) {
    return false;
  }

  // Check for hex colors (#fff, #ffffff, #ffffffaa)
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) {
    return true;
  }

  // Check for rgb/rgba
  if (/^rgba?\(/.test(value)) {
    return true;
  }

  // Check for hsl/hsla
  if (/^hsla?\(/.test(value)) {
    return true;
  }

  // Check for named colors
  if (NAMED_COLORS.has(value.toLowerCase())) {
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
  name: 'no-hardcoded-colors',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow hardcoded color values in JSX inline styles',
      recommended: 'recommended',
    },
    messages: {
      hardcodedColor:
        "Hardcoded color '{{value}}' in style property '{{prop}}'. Use a SolidKit theme variable like var(--sk-text-primary) or var(--sk-bg-secondary).",
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
          if (!propKey || !COLOR_PROPERTIES.has(propKey)) {
            continue;
          }

          if (
            property.value.type === AST_NODE_TYPES.Literal &&
            typeof property.value.value === 'string'
          ) {
            const value = property.value.value;
            if (isHardcodedColor(value)) {
              context.report({
                node: property.value,
                messageId: 'hardcodedColor',
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
