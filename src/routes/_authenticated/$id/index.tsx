import { createFileRoute } from '@tanstack/react-router';
import { currentUserQueryOptions } from '@/entities/user';
import { ChatRoutePage } from '../-components/ChatRoutePage';

export const Route = createFileRoute('/_authenticated/$id/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(currentUserQueryOptions()),
  component: ChatByIdPage
});

function ChatByIdPage() {
  const { id } = Route.useParams();
  return <ChatRoutePage chatId={id} />;
}
