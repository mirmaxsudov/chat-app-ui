'use client';

import { Progress as ProgressPrimitive } from '@base-ui/react/progress';

import { cn } from '@/shared/lib/utils';

const Progress = ({ className, children, value, ...props }: ProgressPrimitive.Root.Props) => (
    <ProgressPrimitive.Root
      className={cn('flex flex-wrap gap-3', className)}
      data-slot='progress'
      value={value}
      {...props}
    >
      {children}
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )

const ProgressTrack = ({ className, ...props }: ProgressPrimitive.Track.Props) => (
    <ProgressPrimitive.Track
      className={cn(
        'bg-muted relative flex h-1 w-full items-center overflow-x-hidden rounded-md',
        className
      )}
      data-slot='progress-track'
      {...props}
    />
  )

const ProgressIndicator = ({ className, ...props }: ProgressPrimitive.Indicator.Props) => (
    <ProgressPrimitive.Indicator
      className={cn('bg-primary h-full transition-all', className)}
      data-slot='progress-indicator'
      {...props}
    />
  )

const ProgressLabel = ({ className, ...props }: ProgressPrimitive.Label.Props) => (
    <ProgressPrimitive.Label
      className={cn('text-xs/relaxed font-medium', className)}
      data-slot='progress-label'
      {...props}
    />
  )

const ProgressValue = ({ className, ...props }: ProgressPrimitive.Value.Props) => (
    <ProgressPrimitive.Value
      className={cn('text-muted-foreground ml-auto text-xs/relaxed tabular-nums', className)}
      data-slot='progress-value'
      {...props}
    />
  )

export { Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue };
