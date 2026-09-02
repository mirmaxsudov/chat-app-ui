import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { LogOut, MessageCircleMore, Phone, ShieldCheck, UserRound } from 'lucide-react';

import { currentUserQueryOptions } from '@/entities/user';
import { clearAuthSession } from '@/features/auth';
import { Button } from '@/shared/ui/button';

const HomePage = () => {
  const router = useRouter();
  const { data: user } = useSuspenseQuery(currentUserQueryOptions());
  const displayName =
    [user.firstname, user.lastname].filter(Boolean).join(' ') || user.username || 'Relay member';
  const initials =
    [user.firstname, user.lastname]
      .filter(Boolean)
      .map((part) => part?.charAt(0))
      .join('') || displayName.charAt(0);

  const handleLogout = async () => {
    clearAuthSession();
    router.options.context.queryClient.clear();
    await router.navigate({ to: '/login', replace: true });
  };

  return (
    <main className='min-h-svh bg-[#f4f5ef] px-5 py-6 text-[#17201d] sm:px-8 lg:px-12'>
      <header className='mx-auto flex max-w-6xl items-center justify-between border-b border-[#cdd5ce] pb-5'>
        <div className='flex items-center gap-3 text-sm font-semibold tracking-[0.18em] uppercase'>
          <span className='grid size-10 place-items-center rounded-full bg-[#173f35] text-[#dff85b]'>
            <MessageCircleMore className='size-5' />
          </span>
          Relay
        </div>
        <Button
          variant='outline'
          size='lg'
          className='h-10 rounded-full border-[#bdc8c0] bg-transparent px-4 text-[#33423d] hover:bg-white/70'
          onClick={handleLogout}
        >
          <LogOut data-icon='inline-start' />
          Log out
        </Button>
      </header>

      <section className='mx-auto grid max-w-6xl gap-8 py-14 lg:grid-cols-[1fr_1.15fr] lg:py-24'>
        <div>
          <p className='mb-5 text-xs font-semibold tracking-[0.17em] text-[#2c7662] uppercase'>
            Authenticated workspace
          </p>
          <h1 className='max-w-xl font-serif text-5xl leading-[0.95] tracking-[-0.045em] text-[#173f35] sm:text-7xl'>
            Welcome back, {user.firstname ?? user.username ?? 'friend'}.
          </h1>
          <p className='mt-7 max-w-md leading-7 text-[#61706a]'>
            Your account was securely loaded from the current-user endpoint. You’re ready to
            continue the conversation.
          </p>
        </div>

        <article className='self-start rounded-[2rem] border border-[#cdd5ce] bg-white/75 p-6 shadow-[0_24px_80px_-45px_rgba(23,63,53,0.45)] backdrop-blur sm:p-9'>
          <div className='flex items-center gap-5 border-b border-[#dce2dd] pb-7'>
            <div className='grid size-16 shrink-0 place-items-center rounded-full bg-[#173f35] font-serif text-2xl text-[#dff85b] uppercase'>
              {initials}
            </div>
            <div className='min-w-0'>
              <h2 className='truncate font-serif text-2xl tracking-[-0.025em]'>{displayName}</h2>
              <p className='mt-1 truncate text-sm text-[#718078]'>
                {user.username ? `@${user.username}` : 'Username not set'}
              </p>
            </div>
          </div>

          <dl className='grid gap-3 pt-7'>
            <div className='flex items-center gap-4 rounded-2xl bg-[#eef1eb] p-4'>
              <Phone className='size-5 text-[#2c7662]' />
              <div>
                <dt className='text-[0.68rem] font-semibold tracking-[0.14em] text-[#748079] uppercase'>
                  Phone number
                </dt>
                <dd className='mt-0.5 text-sm font-medium'>{user.phoneNumber}</dd>
              </div>
            </div>
            <div className='flex items-center gap-4 rounded-2xl bg-[#eef1eb] p-4'>
              <UserRound className='size-5 text-[#2c7662]' />
              <div className='min-w-0'>
                <dt className='text-[0.68rem] font-semibold tracking-[0.14em] text-[#748079] uppercase'>
                  Account ID
                </dt>
                <dd className='mt-0.5 truncate text-sm font-medium'>{user.id}</dd>
              </div>
            </div>
            <div className='flex items-center gap-4 rounded-2xl bg-[#eef1eb] p-4'>
              <ShieldCheck className='size-5 text-[#2c7662]' />
              <div>
                <dt className='text-[0.68rem] font-semibold tracking-[0.14em] text-[#748079] uppercase'>
                  Access
                </dt>
                <dd className='mt-1 flex flex-wrap gap-1.5'>
                  {user.roles.map((role) => (
                    <span
                      key={role}
                      className='rounded-full bg-[#dff85b] px-2.5 py-0.5 text-[0.68rem] font-bold tracking-wide text-[#173f35]'
                    >
                      {role}
                    </span>
                  ))}
                </dd>
              </div>
            </div>
          </dl>
        </article>
      </section>
    </main>
  );
};

export const Route = createFileRoute('/_authenticated/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(currentUserQueryOptions()),
  component: HomePage
});
