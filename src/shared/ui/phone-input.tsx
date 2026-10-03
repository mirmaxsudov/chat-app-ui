import * as React from 'react';
import * as RPNInput from 'react-phone-number-input';

import { cn } from '@/shared/lib/utils';
import { Input } from '@/shared/ui/input';

type Props = Omit<React.ComponentProps<typeof Input>, 'onChange' | 'ref' | 'value'> &
  Omit<RPNInput.Props<typeof RPNInput.default>, 'className' | 'numberInputProps' | 'onChange'> & {
    containerClassName?: string;
    onChange?: (value: RPNInput.Value) => void;
  };

const PhoneInput = ({ className, containerClassName, onChange, ...props }: Props) => (
    <RPNInput.default
      limitMaxLength
      className={cn('flex', containerClassName)}
      countries={['UZ']}
      countrySelectComponent={() => null}
      inputComponent={Input}
      numberInputProps={{ className }}
      /**
       * Handles the onChange event.
       *
       * react-phone-number-input might trigger the onChange event as undefined
       * when a valid phone number is not entered. To prevent this,
       * the value is coerced to an empty string.
       *
       * @param {E164Number | undefined} value - The entered value
       */
      onChange={(value) => onChange?.(value || ('' as RPNInput.Value))}
      {...props}
    />
  );
PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
