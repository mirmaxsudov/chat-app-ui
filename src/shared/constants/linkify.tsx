import type { Opts } from 'linkifyjs';
import { LinkWithContextMenu } from '@/shared/ui/link-with-context-menu';

export const LINKIFY_OPTIONS = {
  target: '_blank',
  rel: 'noopener noreferrer',
  className:
    'text-blue-500 underline underline-offset-2 break-all whitespace-pre-wrap hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
  render: (ir) => <LinkWithContextMenu {...ir} />
} satisfies Opts;
