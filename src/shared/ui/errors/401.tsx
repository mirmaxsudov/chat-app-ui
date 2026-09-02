import { useLingui } from '@lingui/react';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { Button } from '@/shared/ui/button';

export const UnauthorisedError = () => {
  const navigate = useNavigate();
  const { history } = useRouter();
  const { i18n } = useLingui();

  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>401</h1>
        <span className='font-medium'>{i18n._('Unauthorized Access')}</span>
        <p className='text-muted-foreground text-center'>
          {i18n._('Please log in with the appropriate credentials to access this resource.')}
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            {i18n._('Go Back')}
          </Button>
          <Button onClick={() => navigate({ to: '/login' })}>{i18n._('Back to Login')}</Button>
        </div>
      </div>
    </div>
  );
};
