import React from 'react';

import type { FormControlProps } from './FormBase';

import { Input } from '../input';
import { FormBase } from './FormBase';
import { useFieldContext } from './hooks';

type FormInputProps = FormControlProps & React.ComponentProps<typeof Input>;

export const FormInput = ({ label, description, isRequired, ...props }: FormInputProps) => {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase description={description} isRequired={isRequired} label={label}>
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
