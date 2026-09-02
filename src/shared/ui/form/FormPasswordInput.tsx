import React from 'react';

import { PasswordInput } from '@/shared/ui/password-input';

import type { FormControlProps } from './FormBase';

import { FormBase } from './FormBase';
import { useFieldContext } from './hooks';

type FormPasswordInputProps = FormControlProps & React.ComponentProps<typeof PasswordInput>;

export const FormPasswordInput = ({
  label,
  description,
  isRequired,
  ...props
}: FormPasswordInputProps) => {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase isRequired={isRequired} label={label} description={description}>
      <PasswordInput
        aria-invalid={isInvalid}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        {...props}
      />
    </FormBase>
  );
};
