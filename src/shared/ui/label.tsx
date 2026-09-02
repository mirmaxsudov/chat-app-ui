'use client';

import * as React from 'react';

import { cn } from '@/shared/lib/utils';

const Label = ({
  className,
  isRequired,
  ...props
}: React.ComponentProps<'label'> & { isRequired?: boolean }) => {
  return (
    <label
      className={cn(
        'flex items-center gap-2 text-xs leading-none select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className
      )}
      data-slot='label'
      {...props}
    >
      {props.children}
      {isRequired && <span className='text-destructive'>*</span>}
    </label>
  );
};

export { Label };
