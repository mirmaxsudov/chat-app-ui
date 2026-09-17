import { useState } from 'react';
import type { ChatMessage } from '@/features/message/model/message.types';
import { Button } from '@/shared/ui/button';
import type { ChatSummary } from '../model/chat.types';
import { ChatDetails } from './ChatDetails';
import { ChatHeader } from './ChatHeader';
import { MessageComposer } from './MessageComposer';
import { MessageTimeline } from './MessageTimeline';
import { RequestState } from './RequestState';

interface ChatConversationProps {
  chat?: ChatSummary;
  chatError?: string;
  chatLoading: boolean;
  hasMoreMessages: boolean;
  loadingMoreMessages: boolean;
  loadMoreMessages: () => void;
  messages: ChatMessage[];
  messagesError?: string;
  messagesLoading: boolean;
  onBack: () => void;
  retryChat: () => void;
  retryMessages: () => void;
  sendError?: string;
  sending: boolean;
  sendMessage: (text: string, attachments: string[]) => Promise<boolean>;
}

export const ChatConversationView = ({
  chat,
  chatError,
  chatLoading,
  hasMoreMessages,
  loadingMoreMessages,
  loadMoreMessages,
  messages,
  messagesError,
  messagesLoading,
  onBack,
  retryChat,
  retryMessages,
  sendError,
  sending,
  sendMessage
}: ChatConversationProps) => {
  const [showDetails, setShowDetails] = useState(false);

  if (chatLoading || chatError || !chat) {
    return (
      <section className='flex min-h-0 flex-1 flex-col bg-[#dce8e5]'>
        <Button variant='ghost' className='m-3 self-start' onClick={onBack}>
          Back to conversations
        </Button>
        <RequestState
          loading={chatLoading}
          message={chatError ?? 'Loading chat…'}
          onRetry={chatError ? retryChat : undefined}
        />
      </section>
    );
  }

  return (
    <div className='relative flex h-full min-h-0 min-w-0 flex-1'>
      <section className='flex min-h-0 min-w-0 flex-1 flex-col'>
        <ChatHeader
          chat={chat}
          onBack={onBack}
          onToggleDetails={() => setShowDetails((open) => !open)}
        />
        <MessageTimeline
          messages={messages}
          loading={messagesLoading}
          error={messagesError}
          onRetry={retryMessages}
          hasMore={hasMoreMessages}
          loadingMore={loadingMoreMessages}
          onLoadMore={loadMoreMessages}
        />
        <MessageComposer
          isSending={sending}
          disabled={messagesLoading || Boolean(messagesError)}
          error={sendError}
          onSend={sendMessage}
        />
      </section>
      {showDetails && (
        <div className='xl:w-77.5 xl:shrink-0'>
          <ChatDetails chat={chat} onClose={() => setShowDetails(false)} />
        </div>
      )}
    </div>
  );
};
