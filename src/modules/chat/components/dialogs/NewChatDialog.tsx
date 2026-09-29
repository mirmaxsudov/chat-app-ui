import type {FormEvent} from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {  useState } from 'react';

import { CHAT_QUERY_OPTIONS, chatByIdQueryOptions, requestErrorMessage } from '@/modules/chat';
import { Button } from '@/shared/ui/button.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/shared/ui/dialog.tsx';
import { Input } from '@/shared/ui/input.tsx';
import { postDMChat, postSavedChat } from '@/utils/api';

export const NewChatDialog = ({
  onClose,
  onCreated
}: {
  onClose: () => void;
  onCreated: (id: string) => void;
}) => {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  const createChat = useMutation({
    mutationFn: (input: { kind: 'direct'; username: string } | { kind: 'saved' }) =>
      input.kind === 'saved' ? postSavedChat() : postDMChat({ data: { username: input.username } }),
    retry: false,
    meta: { withoutToastOnError: true },
    onSuccess: (chat) => {
      queryClient.setQueryData(chatByIdQueryOptions(chat.id).queryKey, chat);
      void queryClient.invalidateQueries({ queryKey: CHAT_QUERY_OPTIONS.lists() });
      onCreated(chat.id);
      onClose();
    }
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim() || createChat.isPending) return;
    createChat.mutate({ kind: 'direct', username: username.trim() });
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !createChat.isPending) onClose();
      }}
    >
      <DialogContent showCloseButton={!createChat.isPending}>
        <DialogHeader>
          <DialogTitle>New conversation</DialogTitle>
          <DialogDescription>
            Enter an exact username, or open your personal Saved Messages.
          </DialogDescription>
        </DialogHeader>
        <form className='space-y-3' onSubmit={submit}>
          <label className='block text-sm font-medium' htmlFor='chat-username'>
            Username
          </label>
          <Input
            required
            aria-describedby={createChat.isError ? 'create-chat-error' : undefined}
            autoComplete='off'
            className='h-10'
            disabled={createChat.isPending}
            id='chat-username'
            maxLength={64}
            placeholder='@username'
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          {createChat.isError && (
            <p className='text-destructive text-xs' id='create-chat-error' role='alert'>
              {requestErrorMessage()}
            </p>
          )}
          <Button
            className='h-10 w-full bg-[#168acd] text-white'
            disabled={createChat.isPending || !username.trim()}
            type='submit'
          >
            {createChat.isPending ? 'Opening…' : 'Open chat'}
          </Button>
          <Button
            className='h-10 w-full'
            disabled={createChat.isPending}
            type='button'
            variant='outline'
            onClick={() => createChat.mutate({ kind: 'saved' })}
          >
            Saved Messages
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
