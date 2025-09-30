import { notFound, redirect } from 'next/navigation';

import { microFrontendDefinitions } from '@/mfes/config';

import WithMfeHostBoundary from '../../../mfes/lib/mfe-host-boundary';
import SingleSpaRoot from '../../../mfes/lib/single-spa-root';

import type { Metadata } from 'next';

type PageParams = Promise<{ slug?: string[] }>;

type DashboardPageProps = {
  params: PageParams;
};

export default async function DashboardMicroFrontendPage({
  params
}: DashboardPageProps) {
  const resolvedParams = await params;
  const slugValue = resolvedParams.slug;
  const slug = Array.isArray(slugValue) ? slugValue : [];

  if (slug.length === 0) {
    redirect('/dashboard/overview');
  }

  const fullPath = `/dashboard/${slug.join('/')}`;

  if (!findMfeForPath(fullPath)) {
    notFound();
  }

  return (
    <div className='flex flex-1 flex-col overflow-hidden'>
      <WithMfeHostBoundary>
        <SingleSpaRoot />
      </WithMfeHostBoundary>
    </div>
  );
}

export async function generateMetadata({
  params
}: DashboardPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slugValue = resolvedParams.slug;
  const slug = Array.isArray(slugValue) ? slugValue : [];
  const fullPath =
    slug.length === 0 ? '/dashboard/overview' : `/dashboard/${slug.join('/')}`;

  const matchedDefinition = findMfeForPath(fullPath);
  const pageTitle = matchedDefinition?.title ?? 'Dashboard';

  return { title: pageTitle };
}

function findMfeForPath(fullPath: string) {
  return microFrontendDefinitions.find((definition) => {
    const trimmedPrefix = definition.pathPrefix.endsWith('/')
      ? definition.pathPrefix.slice(0, -1)
      : definition.pathPrefix;

    if (fullPath === trimmedPrefix) {
      return true;
    }

    return fullPath.startsWith(`${trimmedPrefix}/`);
  });
}
