import { Component } from 'solid-js';
import { DirectoryPicker, type DirectoryPickerProps } from '../../composites/DirectoryPicker';

export type OnboardingLayoutProps = DirectoryPickerProps;

export const OnboardingLayout: Component<OnboardingLayoutProps> = (props) => {
  return <DirectoryPicker {...props} />;
};
