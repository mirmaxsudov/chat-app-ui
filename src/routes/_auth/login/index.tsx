import { createFileRoute } from '@tanstack/react-router';
import { useLingui } from '@lingui/react/macro';
import { LockKeyholeIcon } from 'lucide-react';

import { LoginForm } from '@/modules/auth';
import { Separator } from '@/shared/ui/separator';

const LoginPage = () => {
  const { t } = useLingui();

  return (
    <section aria-labelledby='login-heading' className='animate-in fade-in duration-500'>
      <header className='mb-10'>
        <div className='mb-8 flex items-center gap-2' aria-hidden='true'>
          <span className='bg-relay-green h-px w-12' />
          <span className='bg-relay-signal ring-relay-deep/10 size-2.5 rounded-full ring-4' />
        </div>
        <h1
          id='login-heading'
          className='text-relay-deep text-4xl leading-[1.02] font-semibold tracking-[-0.045em] sm:text-5xl'
        >
          {t`Welcome back.`}
        </h1>
        <p className='text-relay-muted mt-4 max-w-sm text-sm leading-6'>
          {t`Sign in with the phone number connected to your Relay workspace.`}
        </p>
      </header>

      <LoginForm />

      <Separator className='my-7' />
      <p className='text-relay-muted flex items-center gap-2 text-xs leading-5'>
        <LockKeyholeIcon className='size-3.5' aria-hidden='true' />
        {t`Your credentials are protected in transit.`}
      </p>
    </section>
  );
};

export const Route = createFileRoute('/_auth/login/')({
  component: LoginPage
});
