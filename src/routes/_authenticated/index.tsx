import { createFileRoute } from '@tanstack/react-router';
import { currentUserQueryOptions } from '@/entities/user';
import { ChatRoutePage } from './-components/ChatRoutePage';

export const Route = createFileRoute('/_authenticated/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(currentUserQueryOptions()),
  component: ChatRoutePage
});
