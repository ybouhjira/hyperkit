import { createMemo } from 'solid-js'
import type { ComponentStoryDef } from '../../api/types'
import { useExplorer } from '../../stores/explorerStore'

interface ComponentPreviewProps {
  readonly story: ComponentStoryDef
}

export function ComponentPreview(props: ComponentPreviewProps) {
  const { state } = useExplorer()

  const rendered = createMemo(() => {
    const fn = props.story.render || props.story.component
    if (!fn) return <div>No component to render</div>
    return fn(state.controlValues)
  })

  const isFullscreen = () => props.story.layout === 'fullscreen'

  return (
    <div
      style={{
        padding: isFullscreen() ? '0' : '32px',
        background: isFullscreen() ? 'transparent' : 'var(--sk-bg-primary)',
        height: '100%',
        overflow: isFullscreen() ? 'hidden' : 'auto',
      }}
    >
      {rendered()}
    </div>
  )
}
