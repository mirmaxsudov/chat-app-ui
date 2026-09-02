import type { ReactNode } from 'react';

import type { FormControlProps } from './FormBase';

import { Select, SelectContent, SelectTrigger, SelectValue } from '../select';
import { FormBase } from './FormBase';
import { useFieldContext } from './hooks';

export const FormSelect = ({
  children,
  placeholder,
  disabled,
  ...props
}: FormControlProps & { children: ReactNode; placeholder?: string; disabled?: boolean }) => {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase {...props}>
      <Select
        disabled={disabled}
        value={field.state.value}
        onValueChange={(e) => field.handleChange(e!)}
      >
        <SelectTrigger aria-invalid={isInvalid} id={field.name} onBlur={field.handleBlur}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </FormBase>
  );
};
