import { AtSign, Phone, ShieldCheck } from 'lucide-react';
import { parseAsBoolean, useQueryState } from 'nuqs';

import { formatPhoneNumber } from '@/shared/lib/format';
import { Avatar, AvatarBadge, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/shared/ui/dialog';
import { Separator } from '@/shared/ui/separator';

interface UserProfileDialogProps {
  user: CurrentUser;
}

const getInitials = (user: CurrentUser) =>
  [user.firstname, user.lastname]
    .filter(Boolean)
    .map((part) => part?.[0])
    .join('') ||
  user.username?.[0] ||
  'U';

const getDisplayName = (user: CurrentUser) =>
  [user.firstname, user.lastname].filter(Boolean).join(' ').trim() || user.username || 'My account';

export const UserProfileDialog = ({ user }: UserProfileDialogProps) => {
  const [isOpen, setIsOpen] = useQueryState(
    'profile',
    parseAsBoolean.withDefault(false).withOptions({ history: 'push' })
  );
  const displayName = getDisplayName(user);
  const initials = getInitials(user);
  const accountType = user.roles.includes('ADMIN') ? 'Administrator' : 'Member';

  const setOpen = (open: boolean) => {
    void setIsOpen(open ? true : null, { history: open ? 'push' : 'replace' });
  };

  return (
    <>
      <Button
        aria-label='Open your profile'
        className='h-auto min-w-0 flex-1 justify-start gap-3 rounded-lg px-1 py-1 text-left'
        variant='ghost'
        onClick={() => setOpen(true)}
      >
        <Avatar className='size-9'>
          <AvatarFallback className='bg-primary text-primary-foreground text-xs font-semibold uppercase'>
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className='min-w-0 flex-1'>
          <span className='block truncate text-xs font-semibold'>{displayName}</span>
          <span className='text-muted-foreground block truncate text-[0.66rem] font-normal'>
            {user.username ? `@${user.username}` : 'View your profile'}
          </span>
        </span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogContent className='gap-0 overflow-hidden p-0 sm:max-w-md'>
          <DialogHeader className='px-6 pt-6 pr-12 pb-5'>
            <DialogTitle>Your profile</DialogTitle>
            <DialogDescription>Your account details and sign-in information.</DialogDescription>
          </DialogHeader>

          <div className='flex items-center gap-4 px-6 pb-6'>
            <Avatar className='size-20'>
              <AvatarFallback className='bg-primary text-primary-foreground text-xl font-semibold uppercase'>
                {initials}
              </AvatarFallback>
              <AvatarBadge aria-label='Signed in' />
            </Avatar>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-lg font-semibold tracking-tight'>{displayName}</p>
              <p className='text-muted-foreground mt-0.5 truncate text-sm'>
                {user.username ? `@${user.username}` : 'Username not set'}
              </p>
              <Badge className='mt-3' variant='secondary'>
                {accountType}
              </Badge>
            </div>
          </div>

          <Separator />

          <dl className='flex flex-col px-6 py-2'>
            <div className='flex items-center gap-3 py-3.5'>
              <AtSign aria-hidden='true' className='text-muted-foreground size-4' />
              <div className='min-w-0 flex-1'>
                <dt className='text-muted-foreground text-[0.68rem]'>Username</dt>
                <dd className='mt-0.5 truncate text-sm font-medium'>
                  {user.username ? `@${user.username}` : 'Not set'}
                </dd>
              </div>
            </div>
            <Separator />
            <div className='flex items-center gap-3 py-3.5'>
              <Phone aria-hidden='true' className='text-muted-foreground size-4' />
              <div className='min-w-0 flex-1'>
                <dt className='text-muted-foreground text-[0.68rem]'>Phone number</dt>
                <dd className='mt-0.5 truncate text-sm font-medium'>
                  {formatPhoneNumber(user.phoneNumber) || 'Not provided'}
                </dd>
              </div>
            </div>
            <Separator />
            <div className='flex items-center gap-3 py-3.5'>
              <ShieldCheck aria-hidden='true' className='text-muted-foreground size-4' />
              <div className='min-w-0 flex-1'>
                <dt className='text-muted-foreground text-[0.68rem]'>Account type</dt>
                <dd className='mt-0.5 text-sm font-medium'>{accountType}</dd>
              </div>
            </div>
          </dl>
        </DialogContent>
      </Dialog>
    </>
  );
};
