import { createFileRoute } from '@tanstack/react-router';
import { ChatRoutePage } from './-components/ChatRoutePage';

export const Route = createFileRoute('/_authenticated/')({
  component: ChatRoutePage
});
