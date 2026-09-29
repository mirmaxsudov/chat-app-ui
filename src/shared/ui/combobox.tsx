import { Combobox as ComboboxPrimitive } from '@base-ui/react';
import { CheckIcon, ChevronDownIcon, XIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/shared/lib/utils.ts';
import { Button } from '@/shared/ui/button.tsx';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput
} from '@/shared/ui/input-group.tsx';

const Combobox = ComboboxPrimitive.Root;

const ComboboxValue = ({ ...props }: ComboboxPrimitive.Value.Props) => <ComboboxPrimitive.Value data-slot='combobox-value' {...props} />

const ComboboxTrigger = ({ className, children, ...props }: ComboboxPrimitive.Trigger.Props) => (
    <ComboboxPrimitive.Trigger
      className={cn("[&_svg:not([class*='size-'])]:size-3.5", className)}
      data-slot='combobox-trigger'
      {...props}
    >
      {children}
      <ChevronDownIcon className='text-muted-foreground pointer-events-none size-3.5' />
    </ComboboxPrimitive.Trigger>
  )

const ComboboxClear = ({ className, ...props }: ComboboxPrimitive.Clear.Props) => (
    <ComboboxPrimitive.Clear
      className={cn(className)}
      data-slot='combobox-clear'
      render={<InputGroupButton size='icon-xs' variant='ghost' />}
      {...props}
    >
      <XIcon className='pointer-events-none' />
    </ComboboxPrimitive.Clear>
  )

const ComboboxInput = ({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean;
  showClear?: boolean;
}) => (
    <InputGroup className={cn('w-auto', className)}>
      <ComboboxPrimitive.Input render={<InputGroupInput disabled={disabled} />} {...props} />
      <InputGroupAddon align='inline-end'>
        {showTrigger && (
          <InputGroupButton
            className='group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent'
            data-slot='input-group-button'
            disabled={disabled}
            render={<ComboboxTrigger />}
            size='icon-xs'
            variant='ghost'
          />
        )}
        {showClear && <ComboboxClear disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  )

const ComboboxContent = ({
  className,
  side = 'bottom',
  sideOffset = 6,
  align = 'start',
  alignOffset = 0,
  anchor,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'anchor' | 'side' | 'sideOffset'
  >) => (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        anchor={anchor}
        className='isolate z-50'
        side={side}
        sideOffset={sideOffset}
      >
        <ComboboxPrimitive.Popup
          className={cn(
            'group/combobox-content bg-popover text-popover-foreground ring-foreground/10 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 *:data-[slot=input-group]:bg-input/20 dark:bg-popover data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] origin-(--transform-origin) overflow-hidden rounded-lg shadow-md ring-1 duration-100 data-[chips=true]:min-w-(--anchor-width) *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-7 *:data-[slot=input-group]:border-none *:data-[slot=input-group]:shadow-none',
            className
          )}
          data-chips={!!anchor}
          data-slot='combobox-content'
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )

const ComboboxList = ({ className, ...props }: ComboboxPrimitive.List.Props) => (
    <ComboboxPrimitive.List
      className={cn(
        'no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0',
        className
      )}
      data-slot='combobox-list'
      {...props}
    />
  )

const ComboboxItem = ({ className, children, ...props }: ComboboxPrimitive.Item.Props) => (
    <ComboboxPrimitive.Item
      className={cn(
        "data-highlighted:bg-accent data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground relative flex min-h-7 w-full cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      data-slot='combobox-item'
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className='pointer-events-none absolute right-2 flex items-center justify-center' />
        }
      >
        <CheckIcon className='pointer-events-none' />
      </ComboboxPrimitive.ItemIndicator>
    </ComboboxPrimitive.Item>
  )

const ComboboxGroup = ({ className, ...props }: ComboboxPrimitive.Group.Props) => (
    <ComboboxPrimitive.Group className={cn(className)} data-slot='combobox-group' {...props} />
  )

const ComboboxLabel = ({ className, ...props }: ComboboxPrimitive.GroupLabel.Props) => (
    <ComboboxPrimitive.GroupLabel
      className={cn('text-muted-foreground px-2 py-1.5 text-xs', className)}
      data-slot='combobox-label'
      {...props}
    />
  )

const ComboboxCollection = ({ ...props }: ComboboxPrimitive.Collection.Props) => <ComboboxPrimitive.Collection data-slot='combobox-collection' {...props} />

const ComboboxEmpty = ({ className, ...props }: ComboboxPrimitive.Empty.Props) => (
    <ComboboxPrimitive.Empty
      className={cn(
        'text-muted-foreground hidden w-full justify-center py-2 text-center text-xs/relaxed group-data-empty/combobox-content:flex',
        className
      )}
      data-slot='combobox-empty'
      {...props}
    />
  )

const ComboboxSeparator = ({ className, ...props }: ComboboxPrimitive.Separator.Props) => (
    <ComboboxPrimitive.Separator
      className={cn('bg-border/50 -mx-1 my-1 h-px', className)}
      data-slot='combobox-separator'
      {...props}
    />
  )

const ComboboxChips = ({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> & ComboboxPrimitive.Chips.Props) => (
    <ComboboxPrimitive.Chips
      className={cn(
        'border-input bg-input/20 focus-within:border-ring focus-within:ring-ring/30 has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20 dark:bg-input/30 dark:has-aria-invalid:border-destructive/50 dark:has-aria-invalid:ring-destructive/40 flex min-h-7 flex-wrap items-center gap-1 rounded-md border bg-clip-padding px-2 py-0.5 text-xs/relaxed transition-colors focus-within:ring-2 has-aria-invalid:ring-2 has-data-[slot=combobox-chip]:px-1',
        className
      )}
      data-slot='combobox-chips'
      {...props}
    />
  )

const ComboboxChip = ({
  className,
  children,
  showRemove = true,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean;
}) => (
    <ComboboxPrimitive.Chip
      className={cn(
        'bg-muted-foreground/10 text-foreground flex h-[calc(--spacing(4.75))] w-fit items-center justify-center gap-1 rounded-[calc(var(--radius-sm)-2px)] px-1.5 text-xs/relaxed font-medium whitespace-nowrap has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0',
        className
      )}
      data-slot='combobox-chip'
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          className='-ml-1 opacity-50 hover:opacity-100'
          data-slot='combobox-chip-remove'
          render={<Button size='icon-xs' variant='ghost' />}
        >
          <XIcon className='pointer-events-none' />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  )

const ComboboxChipsInput = ({ className, ...props }: ComboboxPrimitive.Input.Props) => (
    <ComboboxPrimitive.Input
      className={cn('min-w-16 flex-1 outline-none', className)}
      data-slot='combobox-chip-input'
      {...props}
    />
  )

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null);
}

export {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor
};
