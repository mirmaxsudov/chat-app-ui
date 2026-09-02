import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { MessageCircleMore, Radio } from 'lucide-react';

import { currentUserQueryOptions } from '@/entities/user';
import { getAuthSession } from '@/features/auth';

const AuthLayout = () => {
  return (
    <main className='relative min-h-svh overflow-hidden bg-[#f4f5ef] text-[#17201d]'>
      <div className='pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,#b9c4bd_1px,transparent_1px),linear-gradient(to_bottom,#b9c4bd_1px,transparent_1px)] [background-size:64px_64px] opacity-[0.38]' />
      <div className='relative mx-auto grid min-h-svh max-w-[1480px] lg:grid-cols-[1.08fr_0.92fr]'>
        <section className='relative hidden min-h-svh overflow-hidden border-r border-[#cdd5ce] p-12 lg:flex lg:flex-col lg:justify-between xl:p-16'>
          <div className='flex items-center gap-3 text-sm font-semibold tracking-[0.18em] uppercase'>
            <span className='grid size-10 place-items-center rounded-full bg-[#173f35] text-[#dff85b]'>
              <MessageCircleMore className='size-5' />
            </span>
            Relay
          </div>

          <div className='relative z-10 max-w-2xl py-20'>
            <div className='mb-8 inline-flex items-center gap-2 rounded-full border border-[#173f35]/20 bg-white/45 px-4 py-2 text-xs font-semibold tracking-[0.14em] uppercase backdrop-blur'>
              <Radio className='size-3.5 text-[#2c7662]' />
              Conversations, in sync
            </div>
            <h1 className='max-w-xl font-serif text-[clamp(3.8rem,6vw,7rem)] leading-[0.9] tracking-[-0.055em] text-[#173f35]'>
              Pick up right where you left off.
            </h1>
            <p className='mt-8 max-w-lg text-base leading-7 text-[#52615c]'>
              A focused place for the conversations that move work forward—fast, private, and always
              within reach.
            </p>
          </div>

          <div className='flex items-end justify-between text-xs tracking-[0.1em] text-[#6c7974] uppercase'>
            <span>Secure workspace access</span>
            <span>Est. 2026</span>
          </div>

          <div className='pointer-events-none absolute -right-36 bottom-24 size-[30rem] rounded-full border-[72px] border-[#dff85b]/65' />
          <div className='pointer-events-none absolute right-28 bottom-2 size-24 rounded-full bg-[#2c7662]' />
        </section>

        <section className='flex min-h-svh items-center justify-center px-5 py-10 sm:px-10 lg:px-16'>
          <div className='w-full max-w-[440px]'>
            <div className='mb-12 flex items-center gap-3 text-sm font-semibold tracking-[0.18em] uppercase lg:hidden'>
              <span className='grid size-10 place-items-center rounded-full bg-[#173f35] text-[#dff85b]'>
                <MessageCircleMore className='size-5' />
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
  beforeLoad: async ({ context }) => {
    if (!getAuthSession()) return;

    try {
      await context.queryClient.ensureQueryData(currentUserQueryOptions());
    } catch {
      return;
    }

    throw redirect({ to: '/' });
  },
  component: AuthLayout
});
