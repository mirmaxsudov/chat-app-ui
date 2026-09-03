import { LoaderCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export const RequestState = ({
  loading,
  message,
  onRetry
}: {
  loading?: boolean;
  message: string;
  onRetry?: () => void;
}) => (
  <div
    className='flex flex-col items-center gap-3 px-5 py-8 text-center text-sm text-[#667983]'
    role={onRetry ? 'alert' : 'status'}
  >
    {loading && <LoaderCircle className='size-5 animate-spin' aria-hidden='true' />}
    <p>{message}</p>
    {onRetry && (
      <Button variant='outline' onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);
