import type { InfiniteData } from '@tanstack/react-query';
import type { ReactElement } from 'react';

import { useLingui } from '@lingui/react/macro';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';

import {
  MESSAGE_QUERY_OPTIONS,
  removeMessageFromHistory,
  replaceMessageHistory
} from '@/modules/message';
import { copyToClipboard } from '@/shared/lib/clipboard.ts';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from '@/shared/ui/alert-dialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/shared/ui/context-menu.tsx';
import { Spinner } from '@/shared/ui/spinner';
import { deleteMessage } from '@/utils/api';

interface Props {
  message: ChatMessage;
  renderContent: ReactElement;
}

export const MessageContextMenu = ({ renderContent, message }: Props) => {
  const { t } = useLingui();
  const { id: chatId } = useParams({ from: '/_authenticated/$id/' });
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const deleteMessageMutation = useMutation({
    mutationFn: () =>
      deleteMessage({
        chatId,
        messageId: message.id
      }),
    onMutate: async () => {
      const queryFilter = { queryKey: MESSAGE_QUERY_OPTIONS.byChat(chatId) };
      await queryClient.cancelQueries(queryFilter);
      const snapshots = queryClient.getQueriesData<InfiniteData<ApiMessagesResponse>>(queryFilter);

      queryClient.setQueriesData<InfiniteData<ApiMessagesResponse>>(queryFilter, (history) =>
        removeMessageFromHistory(history, message.id)
      );

      return { snapshots };
    },
    onError: (_error, _variables, context) => {
      for (const [queryKey, data] of context?.snapshots ?? []) {
        queryClient.setQueryData(queryKey, replaceMessageHistory(data));
      }
    },
    onSuccess: async () => {
      setDeleteDialogOpen(false);
    }
  });

  return (
    <>
      <ContextMenu>
        {!!renderContent && <ContextMenuTrigger render={renderContent} />}
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuItem onClick={() => copyToClipboard(message.text)}>
              {t`Copy`}
            </ContextMenuItem>
            {message.mine && (
              <ContextMenuItem variant='destructive' onClick={() => setDeleteDialogOpen(true)}>
                {t`Delete`}
              </ContextMenuItem>
            )}
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!deleteMessageMutation.isPending) setDeleteDialogOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2Icon aria-hidden='true' />
            </AlertDialogMedia>
            <AlertDialogTitle>{t`Delete this message?`}</AlertDialogTitle>
            <AlertDialogDescription>
              {t`This message will be permanently removed from the conversation. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMessageMutation.isPending}>
              {t`Cancel`}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMessageMutation.isPending}
              variant='destructive'
              onClick={() => deleteMessageMutation.mutate()}
            >
              {deleteMessageMutation.isPending && <Spinner data-icon='inline-start' />}
              {deleteMessageMutation.isPending ? t`Deleting…` : t`Delete message`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
