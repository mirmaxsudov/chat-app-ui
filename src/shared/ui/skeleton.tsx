import { cn } from '@/shared/lib/utils.ts';

const Skeleton = ({ className, ...props }: React.ComponentProps<'div'>) => (
    <div
      className={cn('bg-muted animate-pulse rounded-md', className)}
      data-slot='skeleton'
      {...props}
    />
  )

export { Skeleton };
