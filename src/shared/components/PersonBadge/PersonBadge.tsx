import { Avatar, AvatarFallback } from '@/shared/components/Avatar'
import { avatarColorClass } from '@/shared/lib/avatarColor'
import { initials } from '@/shared/lib/personUtils'
import { cn } from '@/shared/lib/utils'

interface PersonBadgeProps {
  firstName: string
  lastName: string
  className?: string
}

/**
 * Persona-style chip showing a small avatar with initials next to a full name.
 *
 * Built on shadcn Avatar. Uses neutral muted styling.
 *
 * @param props - Component props.
 * @param props.firstName - Person's first name.
 * @param props.lastName - Person's last name.
 * @param props.className - Optional extra class names.
 * @returns The rendered persona chip.
 */
export function PersonBadge({ firstName, lastName, className }: PersonBadgeProps) {
  return (
    <span
      className={cn(
        'border-border bg-muted text-foreground inline-flex items-center gap-1.5 rounded-full border px-1.5 py-0.5 text-sm',
        className,
      )}
    >
      <Avatar className="size-5 shrink-0">
        <AvatarFallback
          aria-hidden="true"
          className={cn('text-[9px] font-semibold', avatarColorClass(firstName, lastName))}
        >
          {initials(firstName, lastName)}
        </AvatarFallback>
      </Avatar>
      <span className="leading-none">
        {firstName} {lastName}
      </span>
    </span>
  )
}
