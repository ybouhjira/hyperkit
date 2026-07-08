import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  registerNavigable,
  clearNavigables,
  type NavigableDefinition,
  type JsonSchema,
} from '../../navigation/NavigableRegistry';
import { ActionForm } from './ActionForm';
import { createActionForm } from './createActionForm';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeHandler(fn?: (p: unknown) => unknown) {
  return fn ?? vi.fn().mockResolvedValue('ok');
}

function registerWithSchema(
  id: string,
  actionName: string,
  params?: JsonSchema,
  handler?: (p: unknown) => unknown
): void {
  const actions = new Map();
  actions.set(actionName, {
    name: actionName,
    description: actionName,
    ...(params !== undefined ? { params } : {}),
    handler: makeHandler(handler),
  });
  const def: NavigableDefinition = {
    id,
    label: id,
    actions,
  };
  registerNavigable(def);
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  clearNavigables();
});

// ── Test suites ───────────────────────────────────────────────────────────────

describe('ActionForm', () => {
  // ── No-params schema ────────────────────────────────────────────────────────

  describe('no params schema', () => {
    it('renders just a submit button when action has no params', () => {
      registerWithSchema('nav-simple', 'run');
      render(() => <ActionForm target="nav-simple" action="run" />);

      expect(screen.getByRole('button', { name: /execute/i })).toBeInTheDocument();
      // No form fields
      expect(document.querySelector('.sk-action-form__field')).toBeNull();
    });

    it('uses custom submitLabel when provided', () => {
      registerWithSchema('nav-label', 'run');
      render(() => <ActionForm target="nav-label" action="run" submitLabel="Go" />);

      expect(screen.getByRole('button', { name: /go/i })).toBeInTheDocument();
    });

    it('dispatches action with no params on submit', async () => {
      const handler = vi.fn().mockResolvedValue('done');
      registerWithSchema('nav-dispatch', 'run', undefined, handler);
      const onSubmit = vi.fn();

      render(() => <ActionForm target="nav-dispatch" action="run" onSubmit={onSubmit} />);
      fireEvent.click(screen.getByRole('button', { name: /execute/i }));

      await waitFor(() => {
        expect(handler).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
      });
    });
  });

  // ── Navigable not found ─────────────────────────────────────────────────────

  describe('navigable not found', () => {
    it('shows error message when navigable is not registered', () => {
      render(() => <ActionForm target="ghost" action="run" />);
      expect(screen.getByText(/ghost.*is not registered/i)).toBeInTheDocument();
    });
  });

  // ── String field ────────────────────────────────────────────────────────────

  describe('string property', () => {
    it('renders a text input for a string property', () => {
      registerWithSchema('nav-str', 'greet', {
        type: 'object',
        properties: { name: { type: 'string', description: 'Name' } },
        required: [],
      });
      render(() => <ActionForm target="nav-str" action="greet" />);

      expect(screen.getByLabelText(/name/i)).toHaveAttribute('type', 'text');
    });
  });

  // ── Number field ────────────────────────────────────────────────────────────

  describe('number property', () => {
    it('renders a number input for a number property', () => {
      registerWithSchema('nav-num', 'resize', {
        type: 'object',
        properties: { width: { type: 'number', description: 'Width' } },
        required: [],
      });
      render(() => <ActionForm target="nav-num" action="resize" />);

      expect(screen.getByLabelText(/width/i)).toHaveAttribute('type', 'number');
    });

    it('renders a number input for an integer property', () => {
      registerWithSchema('nav-int', 'jump', {
        type: 'object',
        properties: { line: { type: 'integer', description: 'Line' } },
        required: [],
      });
      render(() => <ActionForm target="nav-int" action="jump" />);

      expect(screen.getByLabelText(/line/i)).toHaveAttribute('type', 'number');
    });
  });

  // ── Boolean field ───────────────────────────────────────────────────────────

  describe('boolean property', () => {
    it('renders a checkbox for a boolean property', () => {
      registerWithSchema('nav-bool', 'toggle', {
        type: 'object',
        properties: { enabled: { type: 'boolean', description: 'Enabled' } },
        required: [],
      });
      render(() => <ActionForm target="nav-bool" action="toggle" />);

      expect(screen.getByLabelText(/enabled/i)).toHaveAttribute('type', 'checkbox');
    });
  });

  // ── Enum field ──────────────────────────────────────────────────────────────

  describe('enum property', () => {
    it('renders a select dropdown for a string+enum property', () => {
      registerWithSchema('nav-enum', 'setMode', {
        type: 'object',
        properties: {
          mode: { type: 'string', description: 'Mode', enum: ['light', 'dark', 'auto'] },
        },
        required: [],
      });
      render(() => <ActionForm target="nav-enum" action="setMode" />);

      const select = screen.getByLabelText(/mode/i);
      expect(select.tagName.toLowerCase()).toBe('select');
      expect(screen.getByRole('option', { name: 'light' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'dark' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'auto' })).toBeInTheDocument();
    });
  });

  // ── Default values ──────────────────────────────────────────────────────────

  describe('default values', () => {
    it('pre-fills string field with the schema default', () => {
      registerWithSchema('nav-def', 'search', {
        type: 'object',
        properties: { query: { type: 'string', description: 'Query', default: 'hello' } },
        required: [],
      });
      render(() => <ActionForm target="nav-def" action="search" />);

      expect(screen.getByLabelText(/query/i)).toHaveValue('hello');
    });

    it('pre-fills number field with the schema default', () => {
      registerWithSchema('nav-defnum', 'go', {
        type: 'object',
        properties: { line: { type: 'number', description: 'Line', default: 42 } },
        required: [],
      });
      render(() => <ActionForm target="nav-defnum" action="go" />);

      expect(screen.getByLabelText(/line/i)).toHaveValue(42);
    });

    it('pre-fills boolean field with the schema default', () => {
      registerWithSchema('nav-defbool', 'set', {
        type: 'object',
        properties: { flag: { type: 'boolean', description: 'Flag', default: true } },
        required: [],
      });
      render(() => <ActionForm target="nav-defbool" action="set" />);

      expect(screen.getByLabelText(/flag/i)).toBeChecked();
    });
  });

  // ── Required validation ─────────────────────────────────────────────────────

  describe('required field validation', () => {
    it('shows a required indicator (*) for required fields', () => {
      registerWithSchema('nav-req', 'send', {
        type: 'object',
        properties: { message: { type: 'string', description: 'Message' } },
        required: ['message'],
      });
      render(() => <ActionForm target="nav-req" action="send" />);

      // The label should contain a required indicator
      const label = screen.getByText(/message/i).closest('label');
      expect(label?.textContent).toContain('*');
    });

    it('shows validation error when submitting empty required field', async () => {
      const handler = vi.fn().mockResolvedValue('ok');
      registerWithSchema(
        'nav-val',
        'send',
        {
          type: 'object',
          properties: { message: { type: 'string', description: 'Message' } },
          required: ['message'],
        },
        handler
      );
      render(() => <ActionForm target="nav-val" action="send" />);

      fireEvent.click(screen.getByRole('button', { name: /execute/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(handler).not.toHaveBeenCalled();
      });
    });

    it('dispatches after required field is filled', async () => {
      const handler = vi.fn().mockResolvedValue('ok');
      registerWithSchema(
        'nav-fill',
        'send',
        {
          type: 'object',
          properties: { message: { type: 'string', description: 'Message' } },
          required: ['message'],
        },
        handler
      );
      const onSubmit = vi.fn();
      render(() => <ActionForm target="nav-fill" action="send" onSubmit={onSubmit} />);

      const input = screen.getByLabelText(/message/i);
      fireEvent.input(input, { target: { value: 'hello' } });
      fireEvent.click(screen.getByRole('button', { name: /execute/i }));

      await waitFor(() => {
        expect(handler).toHaveBeenCalledTimes(1);
        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
      });
    });
  });

  // ── Submit dispatches correct params ────────────────────────────────────────

  describe('submit with form values', () => {
    it('dispatches action with collected form values', async () => {
      const handler = vi.fn().mockResolvedValue('result');
      registerWithSchema(
        'nav-params',
        'create',
        {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Title' },
            count: { type: 'number', description: 'Count' },
          },
          required: [],
        },
        handler
      );
      render(() => <ActionForm target="nav-params" action="create" />);

      fireEvent.input(screen.getByLabelText(/title/i), { target: { value: 'My Item' } });
      fireEvent.input(screen.getByLabelText(/count/i), { target: { value: '5' } });
      fireEvent.click(screen.getByRole('button', { name: /execute/i }));

      await waitFor(() => {
        expect(handler).toHaveBeenCalledWith(
          expect.objectContaining({ title: 'My Item', count: 5 })
        );
      });
    });
  });

  // ── Error display on failed dispatch ────────────────────────────────────────

  describe('dispatch error display', () => {
    it('shows error message when dispatch returns ok:false', async () => {
      registerWithSchema('nav-fail', 'boom', undefined, () => {
        throw new Error('Something exploded');
      });
      const onError = vi.fn();
      render(() => <ActionForm target="nav-fail" action="boom" onError={onError} />);

      fireEvent.click(screen.getByRole('button', { name: /execute/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/something exploded/i)).toBeInTheDocument();
        expect(onError).toHaveBeenCalledWith(expect.stringContaining('Something exploded'));
      });
    });
  });

  // ── Loading state ───────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('disables submit button and shows loading text during dispatch', async () => {
      let resolveHandler!: () => void;
      const slowHandler = vi.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveHandler = resolve;
          })
      );

      registerWithSchema('nav-slow', 'run', undefined, slowHandler);
      render(() => <ActionForm target="nav-slow" action="run" />);

      const btn = screen.getByRole('button', { name: /execute/i });
      fireEvent.click(btn);

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeDisabled();
        expect(screen.getByRole('button')).toHaveTextContent(/loading/i);
      });

      // Resolve to clean up
      resolveHandler();
      await waitFor(() => {
        expect(screen.getByRole('button')).not.toBeDisabled();
      });
    });
  });

  // ── CSS & style props ────────────────────────────────────────────────────────

  describe('class and style props', () => {
    it('applies custom class to the form', () => {
      registerWithSchema('nav-cls', 'run');
      render(() => <ActionForm target="nav-cls" action="run" class="my-form" />);

      expect(document.querySelector('.sk-action-form')).toHaveClass('my-form');
    });

    it('applies inline style to the form', () => {
      registerWithSchema('nav-sty', 'run');
      render(() => <ActionForm target="nav-sty" action="run" style={{ opacity: '0.5' }} />);

      const form = document.querySelector('.sk-action-form') as HTMLElement;
      expect(form?.style.opacity).toBe('0.5');
    });
  });

  // ── Label fallback ───────────────────────────────────────────────────────────

  describe('label fallback', () => {
    it('falls back to property name when description is absent', () => {
      registerWithSchema('nav-noDesc', 'act', {
        type: 'object',
        properties: { myField: { type: 'string' } },
        required: [],
      });
      render(() => <ActionForm target="nav-noDesc" action="act" />);

      expect(screen.getByLabelText(/myField/i)).toBeInTheDocument();
    });
  });
});

// ── createActionForm factory ──────────────────────────────────────────────────

describe('createActionForm', () => {
  it('returns a component bound to the given target and action', async () => {
    const handler = vi.fn().mockResolvedValue('bound');
    registerWithSchema('bound-target', 'bound-action', undefined, handler);
    const BoundForm = createActionForm('bound-target', 'bound-action');

    const onSubmit = vi.fn();
    render(() => <BoundForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /execute/i }));

    await waitFor(() => {
      expect(handler).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ ok: true }));
    });
  });

  it('shows error when bound navigable is not registered', () => {
    const BoundForm = createActionForm('missing-nav', 'action');
    render(() => <BoundForm />);

    expect(screen.getByText(/missing-nav.*is not registered/i)).toBeInTheDocument();
  });
});
