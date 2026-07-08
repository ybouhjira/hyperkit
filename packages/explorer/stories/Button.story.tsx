import { Button } from '@ybouhjira/hyperkit'
import { defineStory, control } from '../src/api'

export const ButtonStory = defineStory({
  title: 'Button',
  category: 'Primitives',
  component: Button,
  controls: {
    variant: control.select(
      ['primary', 'secondary', 'ghost', 'danger', 'outline', 'link'],
      'primary',
      'Variant'
    ),
    size: control.select(['sm', 'md', 'lg'], 'md', 'Size'),
    disabled: control.boolean(false, 'Disabled'),
    loading: control.boolean(false, 'Loading'),
    fullWidth: control.boolean(false, 'Full Width'),
    rounded: control.boolean(false, 'Rounded'),
    children: control.text('Click Me', 'Label'),
  },
})
