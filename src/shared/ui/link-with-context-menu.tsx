import type { IntermediateRepresentation } from 'linkifyjs';
import { CopyIcon } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/shared/ui/context-menu';
import { useLingui } from '@lingui/react/macro';

const copyToClipboard = async (value: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();

  const copied = document.execCommand('copy');
  textarea.remove();

  if (!copied) throw new Error('Copy command was rejected');
};

export const LinkWithContextMenu = ({ attributes, content }: IntermediateRepresentation) => {
  const { t } = useLingui();

  const href = String(attributes.href);

  const handleCopy = async () => {
    try {
      await copyToClipboard(href);
    } catch {
      //
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger
        className={attributes.class}
        render={<a href={href} target={attributes.target} rel={attributes.rel} title={href} />}
      >
        {content}
      </ContextMenuTrigger>
      <ContextMenuContent className='min-w-36' sideOffset={4}>
        <ContextMenuItem onClick={() => void handleCopy()}>
          <CopyIcon aria-hidden='true' />
          {t`Copy link`}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
