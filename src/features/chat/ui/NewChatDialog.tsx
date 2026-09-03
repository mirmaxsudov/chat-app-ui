import { useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/shared/ui/dialog';
import { chatByIdQueryOptions, chatQueryKeys, postDMChat, postSavedChat } from '../api';
import { requestErrorMessage } from '../model/request-error';

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
    mutationFn: (input: { kind: 'saved' } | { kind: 'direct'; username: string }) =>
      input.kind === 'saved' ? postSavedChat() : postDMChat({ data: { username: input.username } }),
    retry: false,
    meta: { withoutToastOnError: true },
    onSuccess: (chat) => {
      queryClient.setQueryData(chatByIdQueryOptions(chat.id).queryKey, chat);
      void queryClient.invalidateQueries({ queryKey: chatQueryKeys.lists() });
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
        <form onSubmit={submit} className='space-y-3'>
          <label htmlFor='chat-username' className='block text-sm font-medium'>
            Username
          </label>
          <Input
            id='chat-username'
            value={username}
            maxLength={64}
            required
            autoComplete='off'
            disabled={createChat.isPending}
            aria-describedby={createChat.isError ? 'create-chat-error' : undefined}
            className='h-10'
            placeholder='@username'
            onChange={(event) => setUsername(event.target.value)}
          />
          {createChat.isError && (
            <p id='create-chat-error' role='alert' className='text-destructive text-xs'>
              {requestErrorMessage(createChat.error, 'Unable to create the chat.')}
            </p>
          )}
          <Button
            type='submit'
            disabled={createChat.isPending || !username.trim()}
            className='h-10 w-full bg-[#168acd] text-white'
          >
            {createChat.isPending ? 'Opening…' : 'Open chat'}
          </Button>
          <Button
            type='button'
            variant='outline'
            disabled={createChat.isPending}
            className='h-10 w-full'
            onClick={() => createChat.mutate({ kind: 'saved' })}
          >
            Saved Messages
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
