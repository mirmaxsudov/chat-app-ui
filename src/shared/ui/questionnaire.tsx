'use client';

import { Questionnaire as QuestionnairePrimitive } from '@shadcn/react/questionnaire';
import { CheckIcon } from 'lucide-react';
import * as React from 'react';

import type {Button} from '@/shared/ui/button.tsx';

import { cn } from '@/shared/lib/utils.ts';
import {  buttonVariants } from '@/shared/ui/button.tsx';

const Questionnaire = ({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Root>) => (
    <QuestionnairePrimitive.Root
      className={cn('flex w-full min-w-0 flex-col gap-4', className)}
      data-slot='questionnaire'
      {...props}
    />
  )

const QuestionnaireProgress = ({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Progress>) => (
    <QuestionnairePrimitive.Progress
      className={cn(
        'text-muted-foreground min-h-[1lh] w-fit min-w-[14ch] text-[0.625rem] font-medium tabular-nums',
        className
      )}
      data-slot='questionnaire-progress'
      {...props}
    />
  )

const QuestionnaireItem = ({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Item>) => (
    <QuestionnairePrimitive.Item
      className={cn('flex min-w-0 flex-col gap-3 border-0 p-0 outline-none', className)}
      data-slot='questionnaire-item'
      {...props}
    />
  )

const QuestionnaireTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Title>) => (
    <QuestionnairePrimitive.Title
      className={cn(
        'font-heading text-sm font-semibold text-pretty [&:not(:has(~[data-slot=questionnaire-description]))]:mb-3',
        className
      )}
      data-slot='questionnaire-title'
      {...props}
    />
  )

const QuestionnaireDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Description>) => (
    <QuestionnairePrimitive.Description
      className={cn('text-muted-foreground text-xs/relaxed text-pretty', className)}
      data-slot='questionnaire-description'
      {...props}
    />
  )

const QuestionnaireChoices = ({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Choices>) => (
    <QuestionnairePrimitive.Choices
      className={cn('group/questionnaire-choices grid min-w-0 gap-1.5', className)}
      data-slot='questionnaire-choices'
      {...props}
    />
  )

const QuestionnaireChoice = ({
  children,
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Choice>) => (
    <QuestionnairePrimitive.Choice
      className={cn(
        'group/questionnaire-choice border-input hover:bg-input/40 has-[>input:focus-visible]:border-ring has-[>input:focus-visible]:ring-ring/30 data-invalid:border-destructive data-checked:border-primary/40 data-checked:bg-primary/10 relative flex min-h-11 cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 text-start text-xs/relaxed transition-colors outline-none select-none has-[>input:focus-visible]:ring-2',
        'data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className
      )}
      data-slot='questionnaire-choice'
      {...props}
    >
      <QuestionnairePrimitive.ChoiceInput
        className='absolute inset-0 z-10 size-full cursor-pointer opacity-0'
        data-slot='questionnaire-choice-input'
      />
      <span
        aria-hidden='true'
        className='border-input group-data-checked/questionnaire-choice:border-primary group-data-checked/questionnaire-choice:bg-primary group-data-checked/questionnaire-choice:text-primary-foreground dark:bg-input/30 dark:group-data-checked/questionnaire-choice:bg-primary pointer-events-none relative flex size-4 shrink-0 translate-y-[--spacing(0.45)] items-center justify-center rounded-[4px] border group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5 group-data-[type=radio]/questionnaire-choice:rounded-full'
        data-slot='questionnaire-choice-indicator'
      >
        <span
          className='bg-primary-foreground hidden size-2 rounded-full group-data-checked/questionnaire-choice:block group-data-[type=checkbox]/questionnaire-choice:hidden'
          data-slot='questionnaire-choice-indicator-dot'
        />
        <CheckIcon
          className='hidden size-3.5 group-data-checked/questionnaire-choice:block group-data-[type=radio]/questionnaire-choice:hidden'
          data-slot='questionnaire-choice-indicator-check'
        />
      </span>
      <QuestionnairePrimitive.ChoiceLabel
        className='flex min-w-0 flex-1 flex-col gap-0.5 leading-snug'
        data-slot='questionnaire-choice-label'
      >
        {children}
      </QuestionnairePrimitive.ChoiceLabel>
      <QuestionnairePrimitive.ChoiceShortcut
        className='border-input bg-background/80 text-muted-foreground pointer-events-none ms-auto hidden size-4 shrink-0 translate-y-[--spacing(0.45)] items-center justify-center rounded-sm border font-mono text-[0.5625rem] leading-none font-medium group-has-data-[slot=questionnaire-choice-description]/questionnaire-choice:translate-y-0.5 group-data-[shortcut]/questionnaire-choice:inline-flex'
        data-slot='questionnaire-choice-shortcut'
      />
    </QuestionnairePrimitive.Choice>
  )

const QuestionnaireChoiceDescription = ({ className, ...props }: React.ComponentProps<'span'>) => (
    <span
      className={cn('text-muted-foreground', className)}
      data-slot='questionnaire-choice-description'
      {...props}
    />
  )

const QuestionnaireInput = ({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Input>) => (
    <div
      className='group/questionnaire-input relative w-full min-w-0'
      data-slot='questionnaire-input-wrapper'
    >
      <QuestionnairePrimitive.Input
        className={cn(
          'border-input bg-input/20 focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-7 min-h-11 w-full min-w-0 rounded-md border px-2 py-0.5 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2 sm:min-h-0 md:text-xs/relaxed',
          'selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground',
          className
        )}
        data-slot='questionnaire-input'
        {...props}
      />
    </div>
  )

const QuestionnaireError = ({
  className,
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Error>) => (
    <QuestionnairePrimitive.Error
      className={cn('text-destructive mt-2 text-xs/relaxed', className)}
      data-slot='questionnaire-error'
      {...props}
    />
  )

const QuestionnaireActions = ({ className, ...props }: React.ComponentProps<'div'>) => (
    <div
      className={cn(
        'grid min-h-11 w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1.5 sm:min-h-7',
        className
      )}
      data-slot='questionnaire-actions'
      {...props}
    />
  )

const QuestionnairePrevious = ({
  children,
  className,
  size = 'default',
  variant = 'outline',
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Previous> &
  Pick<React.ComponentProps<typeof Button>, 'size' | 'variant'>) => (
    <QuestionnairePrimitive.Previous
      className={cn(
        buttonVariants({ size, variant }),
        'col-start-1 row-start-1 min-h-11 justify-self-start sm:min-h-0',
        className
      )}
      data-size={size}
      data-slot='questionnaire-previous'
      data-variant={variant}
      {...props}
    >
      {children ?? 'Previous'}
    </QuestionnairePrimitive.Previous>
  )

const QuestionnaireSkip = ({
  children,
  className,
  size = 'default',
  variant = 'outline',
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Skip> &
  Pick<React.ComponentProps<typeof Button>, 'size' | 'variant'>) => (
    <QuestionnairePrimitive.Skip
      className={cn(
        buttonVariants({ size, variant }),
        'col-start-2 row-start-1 min-h-11 justify-self-end sm:min-h-0',
        className
      )}
      data-size={size}
      data-slot='questionnaire-skip'
      data-variant={variant}
      {...props}
    >
      {children ?? 'Skip'}
    </QuestionnairePrimitive.Skip>
  )

const QuestionnaireNext = ({
  children,
  className,
  size = 'default',
  variant = 'default',
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Next> &
  Pick<React.ComponentProps<typeof Button>, 'size' | 'variant'>) => (
    <QuestionnairePrimitive.Next
      className={cn(
        buttonVariants({ size, variant }),
        'col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0',
        className
      )}
      data-size={size}
      data-slot='questionnaire-next'
      data-variant={variant}
      {...props}
    >
      {children ?? 'Next'}
    </QuestionnairePrimitive.Next>
  )

const QuestionnaireSubmit = ({
  children,
  className,
  size = 'default',
  variant = 'default',
  ...props
}: React.ComponentProps<typeof QuestionnairePrimitive.Submit> &
  Pick<React.ComponentProps<typeof Button>, 'size' | 'variant'>) => (
    <QuestionnairePrimitive.Submit
      className={cn(
        buttonVariants({ size, variant }),
        'col-start-3 row-start-1 min-h-11 justify-self-end sm:min-h-0',
        className
      )}
      data-size={size}
      data-slot='questionnaire-submit'
      data-variant={variant}
      {...props}
    >
      {children ?? 'Submit'}
    </QuestionnairePrimitive.Submit>
  )

export {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle
};
