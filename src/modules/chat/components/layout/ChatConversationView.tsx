import { useState } from 'react';

import { RequestState } from '@/modules/chat';
import { MessageComposer, MessageTimeline } from '@/modules/message';
import { Button } from '@/shared/ui/button';

import { ChatDetails } from './ChatDetails';
import { ChatHeader } from './ChatHeader';

interface ChatConversationProps {
  chat?: ChatSummary;
  chatError?: string;
  chatLoading: boolean;
  hasMoreMessages: boolean;
  loadingMoreMessages: boolean;
  messages: ChatMessage[];
  messagesError?: string;
  messagesLoading: boolean;
  sendError?: string;
  sending: boolean;
  loadMoreMessages: () => void;
  onBack: () => void;
  refreshPendingPreviews: () => Promise<unknown>;
  retryChat: () => void;
  retryMessages: () => void;
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
  refreshPendingPreviews,
  sendError,
  sending,
  sendMessage
}: ChatConversationProps) => {
  const [showDetails, setShowDetails] = useState(false);

  if (chatLoading || chatError || !chat) {
    return (
      <section className='flex min-h-0 flex-1 flex-col bg-[#dce8e5]'>
        <Button className='m-3 self-start' variant='ghost' onClick={onBack}>
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
          error={messagesError}
          hasMore={hasMoreMessages}
          loading={messagesLoading}
          loadingMore={loadingMoreMessages}
          messages={messages}
          onLoadMore={loadMoreMessages}
          onRefreshPendingPreviews={refreshPendingPreviews}
          onRetry={retryMessages}
        />
        <MessageComposer
          disabled={messagesLoading || Boolean(messagesError)}
          error={sendError}
          isSending={sending}
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
