import { useLingui } from '@lingui/react/macro';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { LockKeyholeIcon, MessageCircleMoreIcon } from 'lucide-react';

const AuthLayout = () => {
  const { t } = useLingui();

  return (
    <main className='bg-relay-paper text-relay-deep min-h-svh overflow-hidden'>
      <div className='grid min-h-svh lg:grid-cols-[minmax(0,1.16fr)_minmax(28rem,0.84fr)]'>
        <section className='bg-relay-deep text-primary-foreground relative hidden min-h-svh overflow-hidden px-12 py-10 lg:flex lg:flex-col lg:justify-between xl:px-16 xl:py-12'>
          <div className='relative flex items-center gap-3 text-base font-semibold'>
            <span className='bg-relay-signal text-relay-deep grid size-10 place-items-center rounded-full'>
              <MessageCircleMoreIcon aria-hidden='true' className='size-5' />
            </span>
            Relay
          </div>

          <div className='relative max-w-3xl py-16'>
            <div className='mb-8 flex items-center gap-3 text-sm text-white/65'>
              <span className='bg-relay-signal size-2 rounded-full' />
              {t`Your team is already here.`}
            </div>
            <h2 className='max-w-2xl text-[clamp(4rem,6.8vw,7.5rem)] leading-[0.84] font-semibold tracking-[-0.07em] text-white'>
              {t`Keep the thread moving.`}
            </h2>
            <p className='mt-10 max-w-lg text-base leading-7 text-white/65'>
              {t`Return to the conversations, decisions, and people that keep your work in motion.`}
            </p>
          </div>

          <div className='relative flex items-center gap-2 text-sm text-white/55'>
            <LockKeyholeIcon aria-hidden='true' className='size-4' />
            {t`Private workspace access`}
          </div>

          <div className='pointer-events-none absolute top-[18%] -right-48 size-[34rem] rounded-full border border-white/10' />
          <div className='pointer-events-none absolute top-[24%] -right-32 size-[26rem] rounded-full border border-white/10' />
          <div className='bg-relay-signal/90 pointer-events-none absolute right-20 bottom-20 size-20 rounded-full' />
        </section>

        <section className='relative flex min-h-svh items-center justify-center px-5 py-8 sm:px-10 lg:px-16'>
          <div className='w-full max-w-md'>
            <div className='mb-14 flex items-center gap-3 text-base font-semibold lg:hidden'>
              <span className='bg-relay-deep text-relay-signal grid size-10 place-items-center rounded-full'>
                <MessageCircleMoreIcon aria-hidden='true' className='size-5' />
              </span>
              Relay
            </div>
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  );
};

export const Route = createFileRoute('/_auth')({
  component: AuthLayout
});
