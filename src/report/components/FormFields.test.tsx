import { render, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect, vi } from 'vitest';
import { FormFields } from './FormFields';
import type { FormFieldDef } from '../types';

const allFields: FormFieldDef[] = [
  { type: 'text', id: 'name', label: 'Name', placeholder: 'Your name', required: true },
  { type: 'number', id: 'age', label: 'Age', min: 0, max: 120 },
  {
    type: 'select',
    id: 'tier',
    label: 'Tier',
    options: [
      { id: 'free', label: 'Free' },
      { id: 'pro', label: 'Pro' },
    ],
  },
  { type: 'checkbox', id: 'subscribe', label: 'Subscribe to newsletter' },
  { type: 'textarea', id: 'bio', label: 'Bio', placeholder: 'Tell us about yourself' },
];

describe('FormFields', () => {
  it('renders all field types', () => {
    const { getByLabelText } = render(() => (
      <FormFields id="test-form" fields={allFields} values={{}} onChange={() => {}} />
    ));
    expect(getByLabelText(/Name/)).toBeInTheDocument();
    expect(getByLabelText(/Age/)).toBeInTheDocument();
    expect(getByLabelText(/Tier/)).toBeInTheDocument();
    expect(getByLabelText(/Subscribe/)).toBeInTheDocument();
    expect(getByLabelText(/Bio/)).toBeInTheDocument();
  });

  it('renders optional label when provided', () => {
    const { getByText } = render(() => (
      <FormFields
        id="test-form"
        label="Your Details"
        fields={allFields}
        values={{}}
        onChange={() => {}}
      />
    ));
    expect(getByText('Your Details')).toBeInTheDocument();
  });

  it('does not render label element when label is not provided', () => {
    const { container } = render(() => (
      <FormFields id="test-form" fields={allFields} values={{}} onChange={() => {}} />
    ));
    expect(container.querySelector('.sk-report-form__label')).not.toBeInTheDocument();
  });

  it('typing in a text input calls onChange with updated value', () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(() => (
      <FormFields
        id="test-form"
        fields={[{ type: 'text', id: 'name', label: 'Name' }]}
        values={{}}
        onChange={onChange}
      />
    ));
    fireEvent.input(getByLabelText(/Name/), { target: { value: 'Alice' } });
    expect(onChange).toHaveBeenCalledWith({ name: 'Alice' });
  });

  it('typing in a textarea calls onChange with updated value', () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(() => (
      <FormFields
        id="test-form"
        fields={[{ type: 'textarea', id: 'bio', label: 'Bio' }]}
        values={{}}
        onChange={onChange}
      />
    ));
    fireEvent.input(getByLabelText(/Bio/), { target: { value: 'Hello world' } });
    expect(onChange).toHaveBeenCalledWith({ bio: 'Hello world' });
  });

  it('checking a checkbox calls onChange with true', () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(() => (
      <FormFields
        id="test-form"
        fields={[{ type: 'checkbox', id: 'subscribe', label: 'Subscribe' }]}
        values={{}}
        onChange={onChange}
      />
    ));
    fireEvent.change(getByLabelText(/Subscribe/), { target: { checked: true } });
    expect(onChange).toHaveBeenCalledWith({ subscribe: true });
  });

  it('select renders all options including the placeholder', () => {
    const { getByRole } = render(() => (
      <FormFields
        id="test-form"
        fields={[
          {
            type: 'select',
            id: 'tier',
            label: 'Tier',
            options: [
              { id: 'free', label: 'Free' },
              { id: 'pro', label: 'Pro' },
            ],
          },
        ]}
        values={{}}
        onChange={() => {}}
      />
    ));
    const select = getByRole('combobox') as HTMLSelectElement;
    expect(select.options).toHaveLength(3); // placeholder + 2 options
    expect(select.options[1]?.text).toBe('Free');
    expect(select.options[2]?.text).toBe('Pro');
  });

  it('changing a select calls onChange with selected option id', () => {
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <FormFields
        id="test-form"
        fields={[
          {
            type: 'select',
            id: 'tier',
            label: 'Tier',
            options: [
              { id: 'free', label: 'Free' },
              { id: 'pro', label: 'Pro' },
            ],
          },
        ]}
        values={{}}
        onChange={onChange}
      />
    ));
    fireEvent.change(getByRole('combobox'), { target: { value: 'pro' } });
    expect(onChange).toHaveBeenCalledWith({ tier: 'pro' });
  });

  it('required text field renders required marker', () => {
    const { container } = render(() => (
      <FormFields
        id="test-form"
        fields={[{ type: 'text', id: 'name', label: 'Name', required: true }]}
        values={{}}
        onChange={() => {}}
      />
    ));
    expect(container.querySelector('.sk-report-form__required')).toBeInTheDocument();
  });

  it('non-required field does not render required marker', () => {
    const { container } = render(() => (
      <FormFields
        id="test-form"
        fields={[{ type: 'text', id: 'name', label: 'Name' }]}
        values={{}}
        onChange={() => {}}
      />
    ));
    expect(container.querySelector('.sk-report-form__required')).not.toBeInTheDocument();
  });
});
