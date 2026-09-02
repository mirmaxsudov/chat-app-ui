import type { ReactNode } from 'react';

import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '../field';
import { useFieldContext } from './hooks.ts';

export interface FormControlProps {
  description?: string;
  isRequired?: boolean;
  label: string;
}

type FormBaseProps = FormControlProps & {
  children: ReactNode;
  horizontal?: boolean;
  controlFirst?: boolean;
};

export const FormBase = ({
  children,
  label,
  isRequired,
  description,
  controlFirst,
  horizontal
}: FormBaseProps) => {
  const field = useFieldContext();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const labelElement = (
    <>
      <FieldLabel isRequired={isRequired} htmlFor={field.name}>
        {label}
      </FieldLabel>
      {description && <FieldDescription>{description}</FieldDescription>}
    </>
  );
  const errorElem = isInvalid && <FieldError errors={field.state.meta.errors} />;

  return (
    <Field data-invalid={isInvalid} orientation={horizontal ? 'horizontal' : undefined}>
      {controlFirst ? (
        <>
          {children}
          <FieldContent>
            {labelElement}
            {errorElem}
          </FieldContent>
        </>
      ) : (
        <>
          <FieldContent className='flex-none'>{labelElement}</FieldContent>
          {children}
          {errorElem}
        </>
      )}
    </Field>
  );
};
