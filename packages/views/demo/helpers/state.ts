import { createSignal } from 'solid-js';
import type { Shape, Intent } from '../../src/types';
import type { BlueprintField } from '../../src/annotation';
import { Issue, extractBlueprint } from '../../src';

// Global state for the demo
export const [activePreset, setActivePreset] = createSignal<string>('issue');
export const [blueprint, setBlueprint] = createSignal<BlueprintField[]>(extractBlueprint(Issue));
export const [currentShape, setCurrentShape] = createSignal<Shape>('card');
export const [currentIntent, setCurrentIntent] = createSignal<Intent>('browse');
export const [autoPlay, setAutoPlay] = createSignal(false);
export const [priorityThreshold, setPriorityThreshold] = createSignal(10);
