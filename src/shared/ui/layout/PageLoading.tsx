import { Spinner } from '@/shared/ui/spinner';

export const PageLoading = () => {
  return (
    <div className='grid h-screen place-items-center'>
      <Spinner />
    </div>
  );
};
