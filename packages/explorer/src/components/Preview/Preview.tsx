import { Match, Switch } from 'solid-js'
import type { StoryEntry } from '../../api/types'
import { ComponentPreview } from './ComponentPreview'
import { ServicePreview } from './ServicePreview'

interface PreviewProps {
  readonly story: StoryEntry
}

export function Preview(props: PreviewProps) {
  return (
    <Switch>
      <Match when={props.story.def.kind === 'component' && props.story.def}>
        {(def) => <ComponentPreview story={def()} />}
      </Match>
      <Match when={props.story.def.kind === 'service' && props.story.def}>
        {(def) => <ServicePreview story={def()} />}
      </Match>
    </Switch>
  )
}
