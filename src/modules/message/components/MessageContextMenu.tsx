import type { ReactElement } from 'react';

import { useMutation } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/shared/ui/context-menu.tsx';
import { deleteMessage } from '@/utils/api';

interface Props {
  message: ChatMessage;
  renderContent: ReactElement;
}

export const MessageContextMenu = ({ renderContent, message }: Props) => {
  const { id: chatId } = useParams({ from: '/_authenticated/$id/' });

  const deleteMessageMutation = useMutation({
    mutationFn: () =>
      deleteMessage({
        chatId,
        messageId: message.id
      })
  });

  return (
    <ContextMenu>
      {!!renderContent && <ContextMenuTrigger render={renderContent} />}
      <ContextMenuContent>
        <ContextMenuItem variant='destructive' onClick={() => deleteMessageMutation.mutate()}>
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
