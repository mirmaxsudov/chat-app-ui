import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { cn } from '@/shared/lib/utils';

const Accordion = ({ className, ...props }: AccordionPrimitive.Root.Props) => (
    <AccordionPrimitive.Root
      className={cn('flex w-full flex-col overflow-hidden rounded-md border', className)}
      data-slot='accordion'
      {...props}
    />
  )

const AccordionItem = ({ className, ...props }: AccordionPrimitive.Item.Props) => (
    <AccordionPrimitive.Item
      className={cn('data-open:bg-muted/50 not-last:border-b', className)}
      data-slot='accordion-item'
      {...props}
    />
  )

const AccordionTrigger = ({ className, children, ...props }: AccordionPrimitive.Trigger.Props) => (
    <AccordionPrimitive.Header className='flex'>
      <AccordionPrimitive.Trigger
        className={cn(
          'group/accordion-trigger **:data-[slot=accordion-trigger-icon]:text-muted-foreground relative flex flex-1 items-start justify-between gap-6 border border-transparent p-2 text-left text-xs/relaxed font-medium transition-all outline-none hover:underline aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4',
          className
        )}
        data-slot='accordion-trigger'
        {...props}
      >
        {children}
        <ChevronDownIcon
          className='pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden'
          data-slot='accordion-trigger-icon'
        />
        <ChevronUpIcon
          className='pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline'
          data-slot='accordion-trigger-icon'
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )

const AccordionContent = ({ className, children, ...props }: AccordionPrimitive.Panel.Props) => (
    <AccordionPrimitive.Panel
      className='data-open:animate-accordion-down data-closed:animate-accordion-up overflow-hidden px-2 text-xs/relaxed'
      data-slot='accordion-content'
      {...props}
    >
      <div
        className={cn(
          '[&_a]:hover:text-foreground h-(--accordion-panel-height) pt-0 pb-4 data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4',
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
