'use client';

import { Toast as ToastPrimitive } from '@base-ui/react/toast';
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon
} from 'lucide-react';
import * as React from 'react';

import { cn } from '@/shared/lib/utils.ts';
import { Button } from '@/shared/ui/button.tsx';

const toast = ToastPrimitive.createToastManager();

const ToastProvider = ({ ...props }: ToastPrimitive.Provider.Props) => <ToastPrimitive.Provider {...props} />

const ToastPortal = ({ ...props }: ToastPrimitive.Portal.Props) => <ToastPrimitive.Portal data-slot='toast-portal' {...props} />

const ToastViewport = ({ className, ...props }: ToastPrimitive.Viewport.Props) => (
    <ToastPrimitive.Viewport
      className={cn(
        'pointer-events-none fixed inset-x-4 bottom-4 z-50 mx-auto w-auto max-w-sm outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full',
        className
      )}
      data-slot='toast-viewport'
      {...props}
    />
  )

const Toast = ({ className, ...props }: ToastPrimitive.Root.Props) => (
    <ToastPrimitive.Root
      className={cn(
        'group/toast bg-popover text-popover-foreground focus-visible:border-ring focus-visible:ring-ring/50 pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom rounded-md border shadow-lg will-change-transform outline-none select-none focus-visible:ring-[3px]',
        '[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]',
        'h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]',
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        'data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]',
        'data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]',
        '[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]',
        'data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]',
        'data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
        'data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
        'data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]',
        'data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]',
        'data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]',
        'data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]',
        'data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]',
        className
      )}
      data-slot='toast'
      {...props}
    />
  )

const ToastContent = ({ className, ...props }: ToastPrimitive.Content.Props) => (
    <ToastPrimitive.Content
      className={cn(
        'flex h-full items-center gap-3 overflow-hidden p-4 transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100',
        className
      )}
      data-slot='toast-content'
      {...props}
    />
  )

const ToastTitle = ({ className, ...props }: ToastPrimitive.Title.Props) => (
    <ToastPrimitive.Title
      className={cn('text-sm font-medium', className)}
      data-slot='toast-title'
      {...props}
    />
  )

const ToastDescription = ({ className, ...props }: ToastPrimitive.Description.Props) => (
    <ToastPrimitive.Description
      className={cn('text-muted-foreground text-sm', className)}
      data-slot='toast-description'
      {...props}
    />
  )

const ToastAction = ({
  className,
  render = <Button size='sm' variant='outline' />,
  ...props
}: ToastPrimitive.Action.Props) => (
    <ToastPrimitive.Action
      className={cn('shrink-0', className)}
      data-slot='toast-action'
      render={render}
      {...props}
    />
  )

const ToastClose = ({
  className,
  children,
  render = <Button size='icon-sm' variant='ghost' />,
  ...props
}: ToastPrimitive.Close.Props) => (
    <ToastPrimitive.Close
      className={cn(
        "text-muted-foreground hover:text-foreground relative shrink-0 after:absolute after:-inset-2 after:content-['']",
        className
      )}
      aria-label='Close toast'
      data-slot='toast-close'
      render={render}
      {...props}
    >
      {children ?? <XIcon aria-hidden='true' />}
    </ToastPrimitive.Close>
  )

const ToastIcon = ({ type }: { type: string | undefined }) => {
  let icon: React.ReactNode = null;

  if (type === 'success') {
    icon = <CircleCheckIcon aria-hidden='true' />;
  }

  if (type === 'info') {
    icon = <InfoIcon aria-hidden='true' />;
  }

  if (type === 'warning') {
    icon = <TriangleAlertIcon aria-hidden='true' />;
  }

  if (type === 'error') {
    icon = <OctagonXIcon aria-hidden='true' className='text-destructive' />;
  }

  if (type === 'loading') {
    icon = <Loader2Icon aria-hidden='true' className='animate-spin' />;
  }

  if (!icon) {
    return null;
  }

  return (
    <span
      className="shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
      data-slot='toast-icon'
    >
      {icon}
    </span>
  );
}

const ToastList = () => {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem}>
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastAction />
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}

const Toaster = ({ children, toastManager = toast, ...props }: ToastPrimitive.Provider.Props) => (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  )

const createToastManager = ToastPrimitive.createToastManager;
const useToastManager = ToastPrimitive.useToastManager;

export {
  createToastManager,
  Toast,
  toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  Toaster,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  useToastManager
};
