import { EyeIcon, EyeOffIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@/shared/ui/input-group';

type PasswordInputProps = Omit<React.ComponentProps<typeof InputGroupInput>, 'type'> & {
  inputClassName?: string;
};

const PasswordInput = ({
  ref,
  className,
  inputClassName,
  disabled,
  ...props
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <InputGroup className={className} data-disabled={disabled}>
      <InputGroupInput
        ref={ref}
        className={cn('h-full px-4', inputClassName)}
        disabled={disabled}
        type={showPassword ? 'text' : 'password'}
        {...props}
      />
      <InputGroupAddon align='inline-end'>
        <InputGroupButton
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          disabled={disabled}
          size='icon-xs'
          onClick={() => setShowPassword((prev) => !prev)}
        >
          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};
PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
