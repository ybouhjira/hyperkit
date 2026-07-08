import { ESLintUtils, TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/ybouhjira/hyperkit/blob/main/docs/eslint-rules/${name}.md`
);

const REACTIVE_SCOPE_NAMES = new Set([
  'createMemo',
  'createEffect',
  'createSignal',
  'createResource',
  'createComputed',
  'createRenderEffect',
]);

const isComponentFunction = (
  node: TSESTree.FunctionDeclaration | TSESTree.FunctionExpression | TSESTree.ArrowFunctionExpression
): boolean => {
  // Check if function body contains JSX
  if (node.body.type === AST_NODE_TYPES.BlockStatement) {
    // Check for return statements with JSX
    for (const statement of node.body.body) {
      if (statement.type === AST_NODE_TYPES.ReturnStatement && statement.argument) {
        if (
          statement.argument.type === AST_NODE_TYPES.JSXElement ||
          statement.argument.type === AST_NODE_TYPES.JSXFragment
        ) {
          return true;
        }
      }
    }
  } else if (
    node.body.type === AST_NODE_TYPES.JSXElement ||
    node.body.type === AST_NODE_TYPES.JSXFragment
  ) {
    // Arrow function with direct JSX body
    return true;
  }

  return false;
};

const isInsideReactiveScope = (
  node: TSESTree.Node,
  componentFunction: TSESTree.Node
): boolean => {
  let current: TSESTree.Node | undefined = node;

  while (current && current !== componentFunction) {
    // Check if inside a CallExpression to a reactive function
    if (current.type === AST_NODE_TYPES.CallExpression) {
      const callee = current.callee;
      if (callee.type === AST_NODE_TYPES.Identifier) {
        if (REACTIVE_SCOPE_NAMES.has(callee.name)) {
          return true;
        }
      }
    }

    // Check if inside an arrow function (creating an accessor)
    if (
      current.type === AST_NODE_TYPES.ArrowFunctionExpression ||
      current.type === AST_NODE_TYPES.FunctionExpression
    ) {
      // If we're inside a nested function that's not the component itself, we're safe
      if (current !== componentFunction) {
        return true;
      }
    }

    // Check if inside JSX expression
    if (current.type === AST_NODE_TYPES.JSXExpressionContainer) {
      return true;
    }

    current = current.parent;
  }

  return false;
};

const extractPropName = (node: TSESTree.MemberExpression): string | null => {
  if (
    node.object.type === AST_NODE_TYPES.Identifier &&
    node.object.name === 'props' &&
    node.property.type === AST_NODE_TYPES.Identifier
  ) {
    return node.property.name;
  }
  return null;
};

export default createRule({
  name: 'no-props-assign-outside-jsx',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow assigning props to variables outside reactive scopes',
      recommended: 'recommended',
    },
    messages: {
      noPropsAssign:
        "Reading 'props.{{prop}}' outside a reactive scope breaks SolidJS reactivity. Wrap in an arrow function: const {{name}} = () => props.{{prop}}",
      noPropsDestructure:
        "Destructuring props breaks SolidJS reactivity. Use props.{{prop}} directly or wrap in an accessor: const {{name}} = () => props.{{prop}}",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    let currentComponentFunction: TSESTree.Node | null = null;

    return {
      ':function'(node: TSESTree.Node) {
        if (
          node.type === AST_NODE_TYPES.FunctionDeclaration ||
          node.type === AST_NODE_TYPES.FunctionExpression ||
          node.type === AST_NODE_TYPES.ArrowFunctionExpression
        ) {
          if (isComponentFunction(node)) {
            currentComponentFunction = node;
          }
        }
      },
      ':function:exit'(node: TSESTree.Node) {
        if (node === currentComponentFunction) {
          currentComponentFunction = null;
        }
      },
      VariableDeclarator(node) {
        if (!currentComponentFunction) {
          return;
        }

        // Check for destructuring: const { foo, bar } = props
        if (
          node.id.type === AST_NODE_TYPES.ObjectPattern &&
          node.init &&
          node.init.type === AST_NODE_TYPES.Identifier &&
          node.init.name === 'props'
        ) {
          if (!isInsideReactiveScope(node, currentComponentFunction)) {
            for (const property of node.id.properties) {
              if (
                property.type === AST_NODE_TYPES.Property &&
                property.key.type === AST_NODE_TYPES.Identifier
              ) {
                const propName = property.key.name;
                const varName =
                  property.value.type === AST_NODE_TYPES.Identifier
                    ? property.value.name
                    : propName;

                context.report({
                  node: node.id,
                  messageId: 'noPropsDestructure',
                  data: {
                    prop: propName,
                    name: varName,
                  },
                });
              }
            }
          }
        }

        // Check for direct assignment: const x = props.foo
        if (node.init) {
          const checkNode = (initNode: TSESTree.Node): void => {
            if (initNode.type === AST_NODE_TYPES.MemberExpression) {
              const propName = extractPropName(initNode);
              if (propName && !isInsideReactiveScope(node, currentComponentFunction!)) {
                const varName =
                  node.id.type === AST_NODE_TYPES.Identifier ? node.id.name : 'value';

                context.report({
                  node: initNode,
                  messageId: 'noPropsAssign',
                  data: {
                    prop: propName,
                    name: varName,
                  },
                });
              }
            } else if (
              initNode.type === AST_NODE_TYPES.LogicalExpression ||
              initNode.type === AST_NODE_TYPES.BinaryExpression
            ) {
              // Check both sides of logical/binary expressions
              checkNode(initNode.left);
              checkNode(initNode.right);
            }
          };

          checkNode(node.init);
        }
      },
    };
  },
});
