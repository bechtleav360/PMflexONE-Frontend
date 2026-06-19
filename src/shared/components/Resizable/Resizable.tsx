import type * as React from 'react'

import { Group, Panel } from 'react-resizable-panels'

import { cn } from '@/shared/lib/utils'

import { ResizableHandle } from './ResizableHandle'

/**
 * Wraps a resizable panel group and applies layout classes.
 * @param props - Group props for the resizable container.
 * @param props.className - Additional class names to merge with the default layout classes.
 * @returns The rendered resizable panel group.
 */
function ResizablePanelGroup({ className, ...props }: React.ComponentProps<typeof Group>) {
  return (
    <Group
      className={cn(
        'flex h-full w-full',
        props.orientation === 'vertical' && 'flex-col',
        className,
      )}
      {...props}
    />
  )
}

const ResizablePanel = Panel

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
