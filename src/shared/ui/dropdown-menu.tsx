import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { CheckIcon, ChevronRightIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/shared/lib/utils.ts';

const DropdownMenu = ({ ...props }: MenuPrimitive.Root.Props) => <MenuPrimitive.Root data-slot='dropdown-menu' {...props} />

const DropdownMenuPortal = ({ ...props }: MenuPrimitive.Portal.Props) => <MenuPrimitive.Portal data-slot='dropdown-menu-portal' {...props} />

const DropdownMenuTrigger = ({ ...props }: MenuPrimitive.Trigger.Props) => <MenuPrimitive.Trigger data-slot='dropdown-menu-trigger' {...props} />

const DropdownMenuContent = ({
  align = 'start',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<MenuPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>) => (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        className='isolate z-50 outline-none'
        side={side}
        sideOffset={sideOffset}
      >
        <MenuPrimitive.Popup
          className={cn(
            'bg-popover text-popover-foreground ring-foreground/10 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg p-1 shadow-md ring-1 duration-100 outline-none data-closed:overflow-hidden',
            className
          )}
          data-slot='dropdown-menu-content'
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )

const DropdownMenuGroup = ({ ...props }: MenuPrimitive.Group.Props) => <MenuPrimitive.Group data-slot='dropdown-menu-group' {...props} />

const DropdownMenuLabel = ({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean;
}) => (
    <MenuPrimitive.GroupLabel
      className={cn('text-muted-foreground px-2 py-1.5 text-xs data-inset:pl-7.5', className)}
      data-inset={inset}
      data-slot='dropdown-menu-label'
      {...props}
    />
  )

const DropdownMenuItem = ({
  className,
  inset,
  variant = 'default',
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}) => (
    <MenuPrimitive.Item
      className={cn(
        "group/dropdown-menu-item focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:*:[svg]:text-destructive relative flex min-h-7 cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-7.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      data-inset={inset}
      data-slot='dropdown-menu-item'
      data-variant={variant}
      {...props}
    />
  )

const DropdownMenuSub = ({ ...props }: MenuPrimitive.SubmenuRoot.Props) => <MenuPrimitive.SubmenuRoot data-slot='dropdown-menu-sub' {...props} />

const DropdownMenuSubTrigger = ({
  className,
  inset,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean;
}) => (
    <MenuPrimitive.SubmenuTrigger
      className={cn(
        "focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-popup-open:bg-accent data-popup-open:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground flex min-h-7 cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs outline-hidden select-none data-inset:pl-7.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      data-inset={inset}
      data-slot='dropdown-menu-sub-trigger'
      {...props}
    >
      {children}
      <ChevronRightIcon className='ml-auto' />
    </MenuPrimitive.SubmenuTrigger>
  )

const DropdownMenuSubContent = ({
  align = 'start',
  alignOffset = -3,
  side = 'right',
  sideOffset = 0,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) => (
    <DropdownMenuContent
      className={cn(
        'bg-popover text-popover-foreground ring-foreground/10 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 w-auto min-w-32 rounded-lg p-1 shadow-md ring-1 duration-100',
        className
      )}
      align={align}
      alignOffset={alignOffset}
      data-slot='dropdown-menu-sub-content'
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  )

const DropdownMenuCheckboxItem = ({
  className,
  children,
  checked,
  inset,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean;
}) => (
    <MenuPrimitive.CheckboxItem
      className={cn(
        "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground relative flex min-h-7 cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-xs outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-7.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      checked={checked}
      data-inset={inset}
      data-slot='dropdown-menu-checkbox-item'
      {...props}
    >
      <span
        className='pointer-events-none absolute right-2 flex items-center justify-center'
        data-slot='dropdown-menu-checkbox-item-indicator'
      >
        <MenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )

const DropdownMenuRadioGroup = ({ ...props }: MenuPrimitive.RadioGroup.Props) => <MenuPrimitive.RadioGroup data-slot='dropdown-menu-radio-group' {...props} />

const DropdownMenuRadioItem = ({
  className,
  children,
  inset,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  inset?: boolean;
}) => (
    <MenuPrimitive.RadioItem
      className={cn(
        "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground relative flex min-h-7 cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-xs outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-7.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      data-inset={inset}
      data-slot='dropdown-menu-radio-item'
      {...props}
    >
      <span
        className='pointer-events-none absolute right-2 flex items-center justify-center'
        data-slot='dropdown-menu-radio-item-indicator'
      >
        <MenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </MenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )

const DropdownMenuSeparator = ({ className, ...props }: MenuPrimitive.Separator.Props) => (
    <MenuPrimitive.Separator
      className={cn('bg-border/50 -mx-1 my-1 h-px', className)}
      data-slot='dropdown-menu-separator'
      {...props}
    />
  )

const DropdownMenuShortcut = ({ className, ...props }: React.ComponentProps<'span'>) => (
    <span
      className={cn(
        'text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground ml-auto text-[0.625rem] tracking-widest',
        className
      )}
      data-slot='dropdown-menu-shortcut'
      {...props}
    />
  )

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
};
