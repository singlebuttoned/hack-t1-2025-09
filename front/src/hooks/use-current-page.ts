'use client';

import { usePathname } from 'next/navigation';

import type { NavItem } from '@/types/navigation';

import { useEditionNavItems } from './use-edition-nav-items';

export function useCurrentPage(): NavItem {
  const pathname = usePathname();
  const navItems = useEditionNavItems();

  const currentPage = navItems.find((item) => item.url === pathname) ?? null;

  return (
    currentPage ?? {
      title: 'Unknown Page',
      url: pathname,
      icon: 'question'
    }
  );
}
