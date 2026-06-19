import { Bell, Eye, Heart, Users, type LucideIcon } from 'lucide-react'

/** Union of valid matrix zone key values. */
export type ZoneKey =
  | 'zone-manage-closely'
  | 'zone-keep-informed'
  | 'zone-keep-satisfied'
  | 'zone-monitor'

/** Tailwind background colour classes per matrix zone key. */
export const ZONE_COLOURS: Record<ZoneKey, string> = {
  'zone-manage-closely': 'bg-destructive/20',
  'zone-keep-informed': 'bg-warning/20',
  'zone-keep-satisfied': 'bg-warning-dark/20',
  'zone-monitor': 'bg-success/20',
}

/** Metadata for a single quadrant overlay (watermark icon and position). */
export interface QuadrantOverlay {
  zone: ZoneKey
  positionClass: string
  strategyKey: string
  Icon: LucideIcon
}

/** Ordered array of quadrant overlays used to render watermark icons on the matrix. */
export const QUADRANT_OVERLAYS: QuadrantOverlay[] = [
  {
    zone: 'zone-keep-satisfied',
    positionClass: 'left-0 top-0',
    strategyKey: 'KEEP_SATISFIED',
    Icon: Heart,
  },
  {
    zone: 'zone-manage-closely',
    positionClass: 'right-0 top-0',
    strategyKey: 'MANAGE_CLOSELY',
    Icon: Users,
  },
  { zone: 'zone-monitor', positionClass: 'left-0 bottom-0', strategyKey: 'MONITOR', Icon: Eye },
  {
    zone: 'zone-keep-informed',
    positionClass: 'right-0 bottom-0',
    strategyKey: 'KEEP_INFORMED',
    Icon: Bell,
  },
]
