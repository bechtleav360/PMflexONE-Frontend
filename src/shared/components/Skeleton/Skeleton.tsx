import { cn } from '@/shared/lib/utils'

/**
 * Animated shimmer placeholder used while content is loading.
 * @param props - Standard div props; `className` is merged with the shimmer styles.
 * @param props.className - Additional class names merged with the shimmer gradient styles.
 * @returns A div with a left-to-right shimmer gradient animation.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-[skeleton-shimmer_1.4s_infinite] rounded-md bg-[length:200%_100%]',
        'from-muted via-border to-muted bg-gradient-to-r',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
