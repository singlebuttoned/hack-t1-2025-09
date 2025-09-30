'use client';

import { useParams } from 'react-router-dom';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

interface ProductDetailsScreenProps {
  mode: 'create' | 'edit';
}

export function ProductDetailsScreen({ mode }: ProductDetailsScreenProps) {
  const params = useParams();
  const productId = params.productId;

  const isCreateMode = mode === 'create' || productId === 'new';

  return (
    <PageContainer scrollable>
      <div className='flex flex-1 flex-col space-y-4 py-6'>
        <Heading
          title={isCreateMode ? 'Create Product' : 'Edit Product'}
          description='Product form will be migrated to this micro-frontend.'
        />
        <Separator />
        <div className='flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center'>
          <div className='space-y-2'>
            <h2 className='text-xl font-semibold'>Product form placeholder</h2>
            <p className='text-muted-foreground max-w-md text-sm'>
              Move the form modules from <code>src/features/products</code> into
              this screen when ready.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default ProductDetailsScreen;
