import { OTPInput, OTPInputContext } from 'input-otp';
import { MinusIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/shared/lib/utils.ts';

const InputOTP = ({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) => (
    <OTPInput
      containerClassName={cn(
        'cn-input-otp flex items-center has-disabled:opacity-50',
        containerClassName
      )}
      className={cn('disabled:cursor-not-allowed', className)}
      data-slot='input-otp'
      spellCheck={false}
      {...props}
    />
  )

const InputOTPGroup = ({ className, ...props }: React.ComponentProps<'div'>) => (
    <div
      className={cn(
        'has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 flex items-center rounded-md has-aria-invalid:ring-2',
        className
      )}
      data-slot='input-otp-group'
      {...props}
    />
  )

const InputOTPSlot = ({
  index,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  index: number;
}) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      className={cn(
        'border-input bg-input/20 aria-invalid:border-destructive data-[active=true]:border-ring data-[active=true]:ring-ring/30 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40 relative flex size-7 items-center justify-center border-y border-r text-xs/relaxed transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-2',
        className
      )}
      data-active={isActive}
      data-slot='input-otp-slot'
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
          <div className='animate-caret-blink bg-foreground h-4 w-px duration-1000' />
        </div>
      )}
    </div>
  );
}

const InputOTPSeparator = ({ ...props }: React.ComponentProps<'div'>) => (
    <div
      className="flex items-center [&_svg:not([class*='size-'])]:size-4"
      data-slot='input-otp-separator'
      role='separator'
      {...props}
    >
      <MinusIcon />
    </div>
  )

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
