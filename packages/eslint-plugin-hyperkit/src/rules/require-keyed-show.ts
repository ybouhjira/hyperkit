import { ESLintUtils, TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/ybouhjira/hyperkit/blob/main/docs/eslint-rules/${name}.md`
);

const hasKeyedProp = (node: TSESTree.JSXOpeningElement): boolean => {
  return node.attributes.some((attr) => {
    if (attr.type !== AST_NODE_TYPES.JSXAttribute) {
      return false;
    }
    if (attr.name.type !== AST_NODE_TYPES.JSXIdentifier) {
      return false;
    }
    if (attr.name.name !== 'keyed') {
      return false;
    }
    // keyed prop is present - check if it's truthy or boolean
    // <Show keyed> or <Show keyed={true}> both work
    if (!attr.value) {
      return true; // boolean shorthand
    }
    if (attr.value.type === AST_NODE_TYPES.JSXExpressionContainer) {
      const expr = attr.value.expression;
      if (
        expr.type === AST_NODE_TYPES.Literal &&
        expr.value === true
      ) {
        return true;
      }
    }
    return false;
  });
};

const hasWhenProp = (node: TSESTree.JSXOpeningElement): boolean => {
  return node.attributes.some((attr) => {
    if (attr.type !== AST_NODE_TYPES.JSXAttribute) {
      return false;
    }
    if (attr.name.type !== AST_NODE_TYPES.JSXIdentifier) {
      return false;
    }
    return attr.name.name === 'when';
  });
};

const hasCallbackChild = (node: TSESTree.JSXElement): boolean => {
  if (!node.children || node.children.length === 0) {
    return false;
  }

  for (const child of node.children) {
    if (child.type === AST_NODE_TYPES.JSXExpressionContainer) {
      const expr = child.expression;
      if (expr.type === AST_NODE_TYPES.JSXEmptyExpression) {
        continue;
      }
      // Check for arrow function or function expression with exactly 1 parameter
      if (
        (expr.type === AST_NODE_TYPES.ArrowFunctionExpression ||
          expr.type === AST_NODE_TYPES.FunctionExpression) &&
        expr.params.length === 1
      ) {
        return true;
      }
    }
  }

  return false;
};

export default createRule({
  name: 'require-keyed-show',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require keyed prop on <Show> components with render callback children',
      recommended: 'recommended',
    },
    messages: {
      requireKeyed:
        "<Show> with render callback should use 'keyed' prop when the resolved value changes identity. Without 'keyed', children won't re-render when the value changes reference.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      JSXElement(node) {
        if (node.openingElement.name.type !== AST_NODE_TYPES.JSXIdentifier) {
          return;
        }

        if (node.openingElement.name.name !== 'Show') {
          return;
        }

        // Check if has when prop
        if (!hasWhenProp(node.openingElement)) {
          return;
        }

        // Check if has callback child
        if (!hasCallbackChild(node)) {
          return;
        }

        // Check if has keyed prop
        if (hasKeyedProp(node.openingElement)) {
          return;
        }

        // Report: has when, has callback child, but no keyed
        context.report({
          node: node.openingElement,
          messageId: 'requireKeyed',
        });
      },
    };
  },
});
