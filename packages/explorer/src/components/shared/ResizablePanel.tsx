import { createSignal, onCleanup, type JSX } from 'solid-js'

interface ResizablePanelProps {
  readonly direction: 'horizontal' | 'vertical'
  readonly onResize: (size: number) => void
}

export function ResizablePanel(props: ResizablePanelProps) {
  const [isDragging, setIsDragging] = createSignal(false)

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (props.direction === 'horizontal') {
        props.onResize(moveEvent.clientX)
      } else {
        props.onResize(moveEvent.clientY)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const isHorizontal = () => props.direction === 'horizontal'

  return (
    <div
      onMouseDown={handleMouseDown}
      style={{
        [isHorizontal() ? 'width' : 'height']: '4px',
        [isHorizontal() ? 'cursor' : 'cursor']: isHorizontal()
          ? 'col-resize'
          : 'row-resize',
        background: isDragging() ? 'var(--sk-accent)' : 'var(--sk-border)',
        transition: 'background 0.15s',
        'flex-shrink': '0',
      }}
      onMouseEnter={(e) => {
        if (!isDragging()) {
          e.currentTarget.style.background = 'var(--sk-accent)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging()) {
          e.currentTarget.style.background = 'var(--sk-border)'
        }
      }}
    />
  )
}
