'use client';

import { useMemo } from 'react';

import { useEdition } from '@/mfes/lib/edition-context';
import { buildNavItems } from '@/mfes/lib/mfe-helpers';
import type { NavItem } from '@/types/navigation';

export function useEditionNavItems(): NavItem[] {
  const { edition } = useEdition();

  return useMemo(() => buildNavItems(edition), [edition]);
}
