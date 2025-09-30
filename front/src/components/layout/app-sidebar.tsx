'use client';
import { IconMenu2, IconPhotoUp } from '@tabler/icons-react';
import Link from 'next/link';
import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar';
import { useCurrentPage } from '@/hooks/use-current-page';
import { useEditionNavItems } from '@/hooks/use-edition-nav-items';
import { useMediaQuery } from '@/hooks/use-media-query';

import { CompanyLogoSVG } from '../company-logo';
import { Icons } from '../icons';

export const company = {
  name: 'Acme Inc',
  logo: IconPhotoUp,
  plan: 'Enterprise'
};

function AppSidebar() {
  const currentPage = useCurrentPage();
  const navItems = useEditionNavItems();
  const { isOpen } = useMediaQuery();
  const { toggleSidebar, open } = useSidebar();

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  return (
    <Sidebar collapsible='icon' variant='floating'>
      <SidebarHeader>
        <div className='flex w-full justify-center'>
          <CompanyLogoSVG className='h-12 w-12 flex-shrink-0' />
        </div>
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarGroup>
          <SidebarMenu>
            {/* Toggle Menu Item */}
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={open ? 'Close Menu' : 'Open Menu'}
                onClick={toggleSidebar}
              >
                <IconMenu2 />
                <span>{open ? 'Close Menu' : 'Open Menu'}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {navItems.map((item) => {
              const Icon =
                item.icon !== undefined ? Icons[item.icon] : Icons.logo;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={currentPage.url === item.url}
                  >
                    <Link href={item.url}>
                      <Icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

export { AppSidebar };
export default AppSidebar;
