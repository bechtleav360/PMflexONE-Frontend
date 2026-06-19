import {
  BarChart3,
  Briefcase,
  ClipboardList,
  FileText,
  FolderKanban,
  Home,
  Layers,
  LayoutDashboard,
  Mail,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
} from 'lucide-react'

import type { NavGroup } from './types'

/** Static navigation tree for the sidebar. Items use `labelKey` for i18n resolution at render time. */
export const NAVIGATION: NavGroup[] = [
  {
    labelKey: 'nav.general',
    items: [
      { labelKey: 'nav.home', to: '/', icon: Home },
      { labelKey: 'nav.dashboard', to: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    labelKey: 'nav.content',
    items: [
      { labelKey: 'nav.portfolios', to: '/portfolios', icon: Briefcase },
      { labelKey: 'nav.programs', to: '/programs', icon: Layers },
      { labelKey: 'nav.projects', to: '/projects', icon: FolderKanban },
      { labelKey: 'nav.initiationRequests', to: '/initiation-requests', icon: ClipboardList },
      { labelKey: 'nav.documents', to: '/documents', icon: FileText },
      { labelKey: 'nav.reports', to: '/reports', icon: BarChart3 },
      { labelKey: 'nav.messages', to: '/messages', icon: Mail },
    ],
  },
  {
    labelKey: 'nav.administration',
    items: [
      { labelKey: 'nav.users', to: '/users', icon: Users },
      { labelKey: 'nav.profile', to: '/profile', icon: UserCircle },
      { labelKey: 'nav.roleManagement', to: '/admin/role-management', icon: ShieldCheck },
      { labelKey: 'nav.settings', to: '/settings', icon: Settings },
    ],
  },
]
