'use client';
import {
  IconBell,
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconUserCircle
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { useCurrentPage } from '@/hooks/use-current-page';
import { useUser, SignOutButton } from '@/lib/mock-auth';

// Constants
const USER_WIDGET_MIN_WIDTH = '15rem';

function Header() {
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);
  const { user } = useUser();
  const router = useRouter();
  const currentPage = useCurrentPage();

  const IconComponent =
    currentPage.icon !== undefined ? Icons[currentPage.icon] : Icons.dashboard;

  return (
    <header className='flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
      {/* Page Title and Icon Section */}
      <div className='flex items-center gap-3 px-4'>
        <div className='flex h-11 w-11 items-center justify-center rounded-[10px] bg-[#191A1E]'>
          <IconComponent className='h-[26px] w-[26px] text-white' />
        </div>
        <h1 className='text-2xl font-bold text-[#FEFEFE]'>
          {currentPage.title}
        </h1>
      </div>

      {/* User Section */}
      <div className='flex items-center gap-2 px-4'>
        {/* User Block moved from sidebar */}
        {isMounted && user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className='bg-primary hover:bg-primary/90 focus:ring-ring flex h-11 items-center justify-between rounded-[5px] px-[5px] py-0 focus:ring-2 focus:outline-none'
                style={{ minWidth: USER_WIDGET_MIN_WIDTH }}
              >
                <UserAvatarProfile
                  className='bg-secondary h-[34px] w-[34px] rounded-[5px]'
                  showInfo={false}
                  user={user}
                />
                <span className='text-primary-foreground text-sm font-medium'>
                  {user.firstName}
                </span>
                <IconDotsVertical className='text-muted-foreground h-4 w-4' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className='w-56 rounded-lg'
              side='bottom'
              align='end'
              sideOffset={4}
            >
              <DropdownMenuLabel className='p-0 font-normal'>
                <div className='px-1 py-1.5'>
                  <UserAvatarProfile
                    className='h-8 w-8 rounded-lg'
                    showInfo
                    user={user}
                  />
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => router.push('/dashboard/profile')}
                >
                  <IconUserCircle className='mr-2 h-4 w-4' />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconCreditCard className='mr-2 h-4 w-4' />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconBell className='mr-2 h-4 w-4' />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <IconLogout className='mr-2 h-4 w-4' />
                <SignOutButton redirectUrl='/auth/sign-in' />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

export { Header };
export default Header;
