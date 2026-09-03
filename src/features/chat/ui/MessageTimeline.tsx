import { Fragment, useLayoutEffect, useRef } from 'react';
import { Bubble, BubbleContent } from '@/shared/ui/bubble';
import { Button } from '@/shared/ui/button';
import { Message, MessageContent, MessageGroup } from '@/shared/ui/message';
import { cn } from '@/shared/lib/utils';
import type { ChatMessage } from '@/features/message/model/message.types';
import { formatMessageDate, formatMessageTime } from '../model/chat-view';
import { RequestState } from './RequestState';

interface MessageTimelineProps {
  messages: ChatMessage[];
  loading: boolean;
  error?: string;
  onRetry: () => void;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export const MessageTimeline = ({
  messages,
  loading,
  error,
  onRetry,
  hasMore,
  loadingMore,
  onLoadMore
}: MessageTimelineProps) => {
  const viewport = useRef<HTMLDivElement>(null);
  const previous = useRef<{ first?: string; last?: string; height: number }>({ height: 0 });

  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const first = messages[0]?.id;
    const last = messages.at(-1)?.id;
    const wasNearBottom = previous.current.height - element.scrollTop - element.clientHeight < 100;
    if (
      previous.current.first &&
      first !== previous.current.first &&
      last === previous.current.last
    ) {
      element.scrollTop += element.scrollHeight - previous.current.height;
    } else if (
      !previous.current.last ||
      (last !== previous.current.last && (wasNearBottom || messages.at(-1)?.mine))
    ) {
      element.scrollTop = element.scrollHeight;
    }
    previous.current = { first, last, height: element.scrollHeight };
  }, [messages]);

  return (
    <div className='relative min-h-0 flex-1 overflow-hidden bg-[#dce8e5]'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#7b9b93_1.2px,transparent_1.4px)] [background-size:46px_46px] opacity-30' />
      <div
        ref={viewport}
        className='relative h-full overflow-y-auto overscroll-contain'
        aria-label='Message history'
        aria-busy={loading}
      >
        {loading ? (
          <RequestState loading message='Loading messages…' />
        ) : (
          <div className='flex min-h-full flex-col justify-end px-3 py-6 sm:px-6 lg:px-10'>
            {error && <RequestState message={error} onRetry={onRetry} />}
            {hasMore && (
              <Button
                variant='outline'
                className='mx-auto mb-5 bg-white'
                onClick={onLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading…' : 'Load older messages'}
              </Button>
            )}
            {!error && messages.length === 0 && (
              <RequestState message='No messages yet. Say hello!' />
            )}
            <MessageGroup className='gap-2'>
              {messages.map((message, index) => {
                const date = formatMessageDate(message.createdAt);
                return (
                  <Fragment key={message.id}>
                    {(index === 0 || date !== formatMessageDate(messages[index - 1].createdAt)) && (
                      <div className='my-3 flex justify-center'>
                        <span className='rounded-full bg-[#5f7775]/70 px-3 py-1 text-[0.66rem] font-semibold text-white'>
                          {date}
                        </span>
                      </div>
                    )}
                    <Message align={message.mine ? 'end' : 'start'}>
                      <MessageContent>
                        <Bubble
                          variant={message.mine ? 'tinted' : 'outline'}
                          align={message.mine ? 'end' : 'start'}
                          className='max-w-[88%] sm:max-w-[72%]'
                        >
                          <BubbleContent
                            className={cn(
                              'rounded-2xl border-0 px-3.5 py-2 text-[0.79rem] leading-normal shadow-sm',
                              message.mine
                                ? 'rounded-br-md bg-[#d8f3c6] text-[#24332e]'
                                : 'rounded-bl-md bg-white text-[#26343e]'
                            )}
                          >
                            <span className='wrap-anywhere whitespace-pre-wrap'>
                              {message.text}
                            </span>
                            <time
                              dateTime={message.createdAt}
                              className='ml-2 inline-block text-[0.6rem] text-[#73817c]'
                            >
                              {formatMessageTime(message.createdAt)}
                            </time>
                          </BubbleContent>
                        </Bubble>
                      </MessageContent>
                    </Message>
                  </Fragment>
                );
              })}
            </MessageGroup>
          </div>
        )}
      </div>
    </div>
  );
};
