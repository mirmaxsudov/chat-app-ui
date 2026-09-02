import { format } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import React from 'react';

import { Button } from '@/shared/ui/button';
import { Calendar } from '@/shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';

import type { FormControlProps } from './FormBase';

import { FormBase } from './FormBase';
import { useFieldContext } from './hooks';

export const FormDatePicker = (props: FormControlProps) => {
  const field = useFieldContext<Date | undefined>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const [open, setOpen] = React.useState(false);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <FormBase {...props}>
        <PopoverTrigger
          render={
            <Button
              aria-invalid={isInvalid}
              className='w-48 justify-between font-normal'
              id='date'
              variant='outline'
              onBlur={field.handleBlur}
            >
              {field.state.value ? format(field.state.value, 'dd/MM/yyyy') : 'Select date'}
              <ChevronDownIcon />
            </Button>
          }
        />
      </FormBase>
      <PopoverContent align='start' className='w-auto overflow-hidden p-0'>
        <Calendar
          selected={field.state.value}
          captionLayout='dropdown'
          mode='single'
          onSelect={(date) => {
            field.handleChange(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
};
