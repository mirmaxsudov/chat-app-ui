import { LogOut, MessageSquarePlus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useAuth } from '@/modules/auth/hooks';
import { UserProfileDialog } from '@/modules/user';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui/input-group';
import { ScrollArea } from '@/shared/ui/scroll-area';

import { ChatAvatar } from '../ChatAvatar';
import { RequestState } from '../RequestState';

interface ConversationListProps {
  activeChatId: string | null;
  chats: ChatSummary[];
  error?: string;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
  onNewChat: () => void;
  onRetry: () => void;
  onSelect: (chat: ChatSummary) => void;
}

export const ConversationList = ({
  chats,
  activeChatId,
  onSelect,
  onNewChat,
  loading,
  error,
  onRetry,
  hasMore,
  loadingMore,
  onLoadMore
}: ConversationListProps) => {
  const [query, setQuery] = useState('');
  const filteredChats = useMemo(
    () =>
      chats.filter((chat) =>
        (`${chat.name  } ${  chat.username ?? ''  } ${  chat.message}`)
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase())
      ),
    [chats, query]
  );

  const { me, logout } = useAuth();

  return (
    <aside
      aria-label='Conversations'
      className='flex h-full min-h-0 flex-col border-r border-[#dfe6eb] bg-white'
    >
      <div className='flex h-17 shrink-0 items-center gap-2 px-3'>
        <Button
          aria-label='New conversation'
          className='size-10 rounded-full text-[#6d7d89]'
          size='icon-lg'
          variant='ghost'
          onClick={onNewChat}
        >
          <MessageSquarePlus className='size-5' />
        </Button>
        <InputGroup className='h-10 flex-1 rounded-full border-0 bg-[#f1f5f8] px-1 shadow-none'>
          <InputGroupAddon className='pl-3'>
            <Search className='size-4 text-[#83929d]' />
          </InputGroupAddon>
          <InputGroupInput
            aria-label='Search conversations'
            className='h-10 text-sm'
            placeholder='Search loaded chats'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </InputGroup>
      </div>
      <ScrollArea className='min-h-0 flex-1'>
        <div className='px-2 pb-3'>
          {loading && <RequestState loading message='Loading conversations…' />}
          {error && <RequestState message={error} onRetry={onRetry} />}
          {filteredChats.map((chat) => {
            const active = chat.id === activeChatId;
            return (
              <button
                key={chat.id}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[#168acd]',
                  active ? 'bg-[#168acd] text-white' : 'hover:bg-[#f2f6f8]'
                )}
                aria-current={active ? 'true' : undefined}
                type='button'
                onClick={() => onSelect(chat)}
              >
                <ChatAvatar chat={chat} />
                <span className='min-w-0 flex-1'>
                  <span className='flex items-center gap-2'>
                    <span className='truncate text-[0.83rem] font-semibold'>{chat.name}</span>
                    <span
                      className={cn(
                        'ml-auto shrink-0 text-[0.67rem]',
                        active ? 'text-white/80' : 'text-[#87949d]'
                      )}
                    >
                      {chat.time}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'mt-1 block truncate text-[0.74rem]',
                      active ? 'text-white/80' : 'text-[#73818b]'
                    )}
                  >
                    {chat.message}
                  </span>
                </span>
              </button>
            );
          })}
          {!loading && !error && filteredChats.length === 0 && (
            <RequestState
              message={
                query
                  ? 'No matching conversations in loaded chats.'
                  : 'No conversations yet. Start a new chat above.'
              }
            />
          )}
          {hasMore && (
            <div className='px-3 py-4'>
              <Button
                className='w-full'
                disabled={loadingMore}
                variant='outline'
                onClick={onLoadMore}
              >
                {loadingMore ? 'Loading…' : 'Load more conversations'}
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className='flex shrink-0 items-center gap-3 border-t border-[#e4eaee] px-4 py-3'>
        <UserProfileDialog user={me} />
        <Button
          aria-label='Log out'
          className='rounded-full text-[#7b8993]'
          size='icon'
          title='Log out'
          variant='ghost'
          onClick={logout}
        >
          <LogOut />
        </Button>
      </div>
    </aside>
  );
};
