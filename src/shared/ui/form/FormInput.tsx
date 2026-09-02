import React from 'react';

import type { FormControlProps } from './FormBase.tsx';

import { Input } from '../input';
import { FormBase } from './FormBase.tsx';
import { useFieldContext } from './hooks.ts';

type FormInputProps = FormControlProps & React.ComponentProps<typeof Input>;

export const FormInput = ({ label, description, isRequired, ...props }: FormInputProps) => {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase isRequired={isRequired} label={label} description={description}>
      <Input
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
