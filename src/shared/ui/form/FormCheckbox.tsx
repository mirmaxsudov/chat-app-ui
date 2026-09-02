import type { FormControlProps } from './FormBase';

import { Checkbox } from '../checkbox';
import { FormBase } from './FormBase';
import { useFieldContext } from './hooks';

export const FormCheckbox = (props: FormControlProps) => {
  const field = useFieldContext<boolean>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase {...props} controlFirst horizontal>
      <Checkbox
        aria-invalid={isInvalid}
        checked={field.state.value}
        id={field.name}
        name={field.name}
        onBlur={field.handleBlur}
        onCheckedChange={(e) => field.handleChange(e === true)}
      />
    </FormBase>
  );
};
