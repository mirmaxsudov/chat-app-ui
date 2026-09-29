import { createFileRoute } from '@tanstack/react-router';
import { ChatRoutePage } from '../-components/ChatRoutePage';

export const Route = createFileRoute('/_authenticated/$id/')({
  component: ChatByIdPage
});

function ChatByIdPage() {
  const { id } = Route.useParams();
  return <ChatRoutePage chatId={id} />;
}
