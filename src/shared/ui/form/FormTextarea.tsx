import React from 'react';

import type { FormControlProps } from './FormBase';

import { Textarea } from '../textarea';
import { FormBase } from './FormBase';
import { useFieldContext } from './hooks';

type FormTextareaProps = FormControlProps & React.ComponentProps<typeof Textarea>;

export const FormTextarea = ({ label, description, isRequired, ...props }: FormTextareaProps) => {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase isRequired={isRequired} label={label} description={description}>
      <Textarea
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
