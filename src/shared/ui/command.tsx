'use client';

import { Command as CommandPrimitive } from 'cmdk';
import { CheckIcon, SearchIcon } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/shared/ui/dialog';
import { InputGroup, InputGroupAddon } from '@/shared/ui/input-group';

const Command = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) => (
    <CommandPrimitive
      className={cn(
        'bg-popover text-popover-foreground flex size-full flex-col overflow-hidden rounded-xl p-1',
        className
      )}
      data-slot='command'
      {...props}
    />
  )

const CommandDialog = ({
  title = 'Command Palette',
  description = 'Search for a command to run...',
  children,
  className,
  showCloseButton = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, 'children'> & {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
  children: React.ReactNode;
}) => (
    <Dialog {...props}>
      <DialogHeader className='sr-only'>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn('top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0', className)}
        showCloseButton={showCloseButton}
      >
        {children}
      </DialogContent>
    </Dialog>
  )

const CommandInput = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) => (
    <div className='p-1 pb-0' data-slot='command-input-wrapper'>
      <InputGroup className='bg-input/20 dark:bg-input/30 h-8!'>
        <CommandPrimitive.Input
          className={cn(
            'w-full text-xs/relaxed outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          data-slot='command-input'
          {...props}
        />
        <InputGroupAddon>
          <SearchIcon className='size-3.5 shrink-0 opacity-50' />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )

const CommandList = ({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) => (
    <CommandPrimitive.List
      className={cn(
        'no-scrollbar max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none',
        className
      )}
      data-slot='command-list'
      {...props}
    />
  )

const CommandEmpty = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) => (
    <CommandPrimitive.Empty
      className={cn('py-6 text-center text-xs/relaxed', className)}
      data-slot='command-empty'
      {...props}
    />
  )

const CommandGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) => (
    <CommandPrimitive.Group
      className={cn(
        'text-foreground **:[[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 **:[[cmdk-group-heading]]:px-2.5 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium',
        className
      )}
      data-slot='command-group'
      {...props}
    />
  )

const CommandSeparator = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) => (
    <CommandPrimitive.Separator
      className={cn('bg-border/50 -mx-1 my-1 h-px', className)}
      data-slot='command-separator'
      {...props}
    />
  )

const CommandItem = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) => (
    <CommandPrimitive.Item
      className={cn(
        "group/command-item data-selected:bg-muted data-selected:text-foreground data-selected:*:[svg]:text-foreground relative flex min-h-7 cursor-default items-center gap-2 rounded-md px-2.5 py-1.5 text-xs/relaxed outline-hidden select-none in-data-[slot=dialog-content]:rounded-md data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      data-slot='command-item'
      {...props}
    >
      {children}
      <CheckIcon className='ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100' />
    </CommandPrimitive.Item>
  )

const CommandShortcut = ({ className, ...props }: React.ComponentProps<'span'>) => (
    <span
      className={cn(
        'text-muted-foreground group-data-selected/command-item:text-foreground ml-auto text-[0.625rem] tracking-widest',
        className
      )}
      data-slot='command-shortcut'
      {...props}
    />
  )

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
};
