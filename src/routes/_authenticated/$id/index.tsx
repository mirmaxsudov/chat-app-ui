import { createFileRoute } from '@tanstack/react-router';

import { ChatRoutePage } from '../-components/ChatRoutePage';

const ChatByIdPage = () => {
  const { id } = Route.useParams();
  return <ChatRoutePage chatId={id} />;
};

export const Route = createFileRoute('/_authenticated/$id/')({
  component: ChatByIdPage
});
