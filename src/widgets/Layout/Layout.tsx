import { flushSync } from 'react-dom'

import { usePanelRef } from 'react-resizable-panels'
import { Outlet } from 'react-router-dom'

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/shared/components'
import { EscalationDialogProvider } from '@/widgets/EscalationDialogProvider'

import { LayoutHeader } from './LayoutHeader'
import { SidebarCollapseButton } from './SidebarCollapseButton'
import { SidebarNav } from './SidebarNav'
import { useSidebarStore } from './useSidebarStore'

/** Sidebar width constraints in pixels. */
const SIDEBAR_DEFAULT_SIZE_PX = 248
const SIDEBAR_MIN_SIZE_PX = 208
const SIDEBAR_MAX_SIZE_PX = 360
const SIDEBAR_COLLAPSED_SIZE_PX = 72

/**
 * Tailwind classes for the sidebar resize handle — extracted for readability.
 * The glowing accent-active line appears on hover via a CSS `after:` pseudo-element.
 */
const SIDEBAR_HANDLE_CLASS =
  'w-1.5 bg-sidebar after:absolute after:inset-y-0 after:left-[3px] after:w-[2px] ' +
  'after:bg-transparent after:transition-[background,width,left,box-shadow] after:duration-150 ' +
  'hover:after:bg-accent-active hover:after:w-[3px] hover:after:left-[2px] ' +
  'hover:after:shadow-[var(--shadow-accent-glow)]'

/**
 * Root application layout with a sticky header and a resizable left navigation sidebar.
 *
 * The sidebar is horizontally resizable between {@link SIDEBAR_MIN_SIZE_PX} and
 * {@link SIDEBAR_MAX_SIZE_PX} pixels, defaulting to {@link SIDEBAR_DEFAULT_SIZE_PX}.
 * It can be collapsed to {@link SIDEBAR_COLLAPSED_SIZE_PX} via a toggle button,
 * showing only icons. When collapsed, resizing is disabled.
 * Page content is rendered via a React Router {@link Outlet}.
 * @returns The shell layout wrapping all routed pages.
 */
export function Layout() {
  const sidebarRef = usePanelRef()
  const collapsed = useSidebarStore((s) => s.collapsed)
  const setCollapsed = useSidebarStore((s) => s.setCollapsed)

  const handleToggleCollapse = () => {
    if (collapsed) {
      sidebarRef.current?.expand()
      setCollapsed(false)
    } else {
      // flushSync makes collapsible=true take effect before collapse() is called.
      flushSync(() => setCollapsed(true))
      sidebarRef.current?.collapse()
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <LayoutHeader />

      <ResizablePanelGroup
        orientation="horizontal"
        className="flex-1"
      >
        <ResizablePanel
          panelRef={sidebarRef}
          defaultSize={SIDEBAR_DEFAULT_SIZE_PX}
          minSize={SIDEBAR_MIN_SIZE_PX}
          maxSize={SIDEBAR_MAX_SIZE_PX}
          collapsible={collapsed}
          collapsedSize={SIDEBAR_COLLAPSED_SIZE_PX}
          onResize={(size) => setCollapsed(size.inPixels <= SIDEBAR_COLLAPSED_SIZE_PX)}
          className="bg-sidebar"
          style={{ transition: 'width .18s ease' }}
        >
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent">
              <SidebarNav collapsed={collapsed} />
            </div>
            <SidebarCollapseButton
              collapsed={collapsed}
              onToggle={handleToggleCollapse}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle className={collapsed ? 'hidden' : SIDEBAR_HANDLE_CLASS} />

        <ResizablePanel>
          <div className="h-full overflow-y-auto">
            <div className="mx-auto min-h-full max-w-5xl min-w-160">
              <Outlet />
              <EscalationDialogProvider />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
