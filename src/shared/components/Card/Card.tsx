import * as React from 'react'

import { cn } from '@/shared/lib/utils'

import { CardContent } from './CardContent'
import { CardDescription } from './CardDescription'
import { CardFooter } from './CardFooter'
import { CardHeader } from './CardHeader'
import { CardIcon } from './CardIcon'
import { CardTitle } from './CardTitle'

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-card text-card-foreground overflow-hidden rounded-[12px] border shadow-sm',
        className,
      )}
      {...props}
    />
  ),
)
Card.displayName = 'Card'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardIcon }
