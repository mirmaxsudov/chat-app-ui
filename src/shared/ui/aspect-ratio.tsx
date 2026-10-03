import { cn } from '@/shared/lib/utils';

const AspectRatio = ({
  ratio,
  className,
  ...props
}: React.ComponentProps<'div'> & { ratio: number }) => (
    <div
      style={
        {
          '--ratio': ratio
        } as React.CSSProperties
      }
      className={cn('relative aspect-(--ratio)', className)}
      data-slot='aspect-ratio'
      {...props}
    />
  )

export { AspectRatio };
