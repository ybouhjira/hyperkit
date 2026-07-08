import { Component, splitProps, Show } from 'solid-js';
import { Tooltip } from '@kobalte/core/tooltip';
import './CostTracker.css';

export interface CostTrackerProps {
  /** Dollar cost of the request */
  cost: number;
  /** Number of input tokens */
  inputTokens: number;
  /** Number of output tokens */
  outputTokens: number;
  /** Compact mode for narrow headers */
  compact?: boolean;
  /** Additional CSS classes */
  class?: string;
}

const formatTokens = (tokens: number): string => {
  if (tokens < 1000) {
    return tokens.toString();
  }
  return `${(tokens / 1000).toFixed(1)}k`;
};

const formatCost = (cost: number): string => {
  return `$${cost.toFixed(4)}`;
};

export const CostTracker: Component<CostTrackerProps> = (props) => {
  const [local, others] = splitProps(props, [
    'cost',
    'inputTokens',
    'outputTokens',
    'compact',
    'class',
  ]);

  const totalTokens = () => local.inputTokens + local.outputTokens;

  const tooltipContent = () => (
    <div class="sk-cost-tracker__tooltip-content">
      <div class="sk-cost-tracker__tooltip-row">
        <span class="sk-cost-tracker__tooltip-label">Total Cost:</span>
        <span class="sk-cost-tracker__tooltip-value">{formatCost(local.cost)}</span>
      </div>
      <div class="sk-cost-tracker__tooltip-row">
        <span class="sk-cost-tracker__tooltip-label">Input Tokens:</span>
        <span class="sk-cost-tracker__tooltip-value">{local.inputTokens.toLocaleString()}</span>
      </div>
      <div class="sk-cost-tracker__tooltip-row">
        <span class="sk-cost-tracker__tooltip-label">Output Tokens:</span>
        <span class="sk-cost-tracker__tooltip-value">{local.outputTokens.toLocaleString()}</span>
      </div>
      <div class="sk-cost-tracker__tooltip-row">
        <span class="sk-cost-tracker__tooltip-label">Total Tokens:</span>
        <span class="sk-cost-tracker__tooltip-value">{totalTokens().toLocaleString()}</span>
      </div>
    </div>
  );

  const baseClass = () => {
    const classes = ['sk-cost-tracker'];
    if (local.compact) {
      classes.push('sk-cost-tracker--compact');
    }
    if (local.class) {
      classes.push(local.class);
    }
    return classes.join(' ');
  };

  return (
    <Tooltip>
      <Tooltip.Trigger class={baseClass()} {...others}>
        <span class="sk-cost-tracker__cost">{formatCost(local.cost)}</span>
        <Show when={!local.compact}>
          <span class="sk-cost-tracker__tokens">
            <span class="sk-cost-tracker__token-group">
              <span class="sk-cost-tracker__arrow sk-cost-tracker__arrow--up">↑</span>
              <span class="sk-cost-tracker__token-count">{formatTokens(local.inputTokens)}</span>
            </span>
            <span class="sk-cost-tracker__token-group">
              <span class="sk-cost-tracker__arrow sk-cost-tracker__arrow--down">↓</span>
              <span class="sk-cost-tracker__token-count">{formatTokens(local.outputTokens)}</span>
            </span>
          </span>
        </Show>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content class="sk-cost-tracker__tooltip">{tooltipContent()}</Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip>
  );
};
