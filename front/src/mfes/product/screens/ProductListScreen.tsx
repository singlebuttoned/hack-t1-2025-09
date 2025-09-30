'use client';

import { Link } from 'react-router-dom';

import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function ProductListScreen() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4 py-6'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Products'
            description='Product listing will be migrated to this micro-frontend.'
          />
          <Link
            to='new'
            className={cn(buttonVariants({ size: 'sm' }), 'text-xs md:text-sm')}
          >
            Create Product
          </Link>
        </div>
        <Separator />
        <div className='flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center'>
          <div className='space-y-2'>
            <h2 className='text-xl font-semibold'>Product MFE placeholder</h2>
            <p className='text-muted-foreground max-w-md text-sm'>
              The existing product table from <code>src/features/products</code>{' '}
              will be integrated here once it is refactored for runtime usage in
              micro-frontends.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default ProductListScreen;
