import { useMemo, useState } from 'react';
import { LogOut, MessageSquarePlus, Search } from 'lucide-react';
import type { CurrentUser } from '@/entities/user';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Button } from '@/shared/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/shared/ui/input-group';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { cn } from '@/shared/lib/utils';
import type { ChatSummary } from '../model/chat.types';
import { ChatAvatar } from './ChatAvatar';
import { RequestState } from './RequestState';

interface ConversationListProps {
  chats: ChatSummary[];
  activeChatId: string | null;
  currentUser: CurrentUser;
  onLogout: () => void;
  onSelect: (chat: ChatSummary) => void;
  onNewChat: () => void;
  loading: boolean;
  error?: string;
  onRetry: () => void;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export const ConversationList = ({
  chats,
  activeChatId,
  currentUser,
  onLogout,
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
        (chat.name + ' ' + (chat.username ?? '') + ' ' + chat.message)
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase())
      ),
    [chats, query]
  );
  const userInitials =
    [currentUser.firstname, currentUser.lastname]
      .filter(Boolean)
      .map((part) => part?.[0])
      .join('') ||
    currentUser.username?.[0] ||
    'U';

  return (
    <aside
      className='flex h-full min-h-0 flex-col border-r border-[#dfe6eb] bg-white'
      aria-label='Conversations'
    >
      <div className='flex h-[68px] shrink-0 items-center gap-2 px-3'>
        <Button
          variant='ghost'
          size='icon-lg'
          className='size-10 rounded-full text-[#6d7d89]'
          aria-label='New conversation'
          onClick={onNewChat}
        >
          <MessageSquarePlus className='size-5' />
        </Button>
        <InputGroup className='h-10 flex-1 rounded-full border-0 bg-[#f1f5f8] px-1 shadow-none'>
          <InputGroupAddon className='pl-3'>
            <Search className='size-4 text-[#83929d]' />
          </InputGroupAddon>
          <InputGroupInput
            value={query}
            placeholder='Search loaded chats'
            aria-label='Search conversations'
            className='h-10 text-sm'
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
                type='button'
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-[#168acd]',
                  active ? 'bg-[#168acd] text-white' : 'hover:bg-[#f2f6f8]'
                )}
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
                variant='outline'
                className='w-full'
                disabled={loadingMore}
                onClick={onLoadMore}
              >
                {loadingMore ? 'Loading…' : 'Load more conversations'}
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className='flex shrink-0 items-center gap-3 border-t border-[#e4eaee] px-4 py-3'>
        <Avatar className='size-9'>
          <AvatarFallback className='bg-[#1a91d1] text-xs font-semibold text-white uppercase'>
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-xs font-semibold'>
            {currentUser.firstname || currentUser.username || 'My account'}
          </p>
          <p className='truncate text-[0.66rem] text-[#8a98a1]'>
            {currentUser.username ? '@' + currentUser.username : 'My account'}
          </p>
        </div>
        <Button
          variant='ghost'
          size='icon'
          className='rounded-full text-[#7b8993]'
          title='Log out'
          aria-label='Log out'
          onClick={onLogout}
        >
          <LogOut />
        </Button>
      </div>
    </aside>
  );
};
