import { Component } from 'solid-js';
import { Select, type SelectOption } from '../../primitives/Select';

export interface ModelOption {
  id: string;
  name: string;
  description?: string;
  disabled?: boolean;
}

export interface ModelSelectorProps {
  models: ModelOption[];
  value?: string;
  onChange?: (modelId: string) => void;
  disabled?: boolean;
  class?: string;
}

export const ModelSelector: Component<ModelSelectorProps> = (props) => {
  const options = (): SelectOption[] =>
    props.models.map((m) => ({
      value: m.id,
      label: m.name,
      disabled: m.disabled,
    }));

  return (
    <div class={`sk-model-selector ${props.class ?? ''}`} data-testid="model-selector">
      <Select
        options={options()}
        value={props.value}
        onChange={props.onChange}
        placeholder="Select model..."
        disabled={props.disabled}
      />
    </div>
  );
};
