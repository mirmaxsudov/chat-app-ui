import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/shared/ui/context-menu.tsx';
import type { ReactElement } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { deleteMessage } from '@/utils/api';

interface Props {
  renderContent: ReactElement;
  message: ChatMessage;
}

export const MessageContextMenu = ({ renderContent, message }: Props) => {
  const { id: chatId } = useParams({ from: '/_authenticated/$id/' });
  // ToDo
  // useMessageContextPermission();

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
