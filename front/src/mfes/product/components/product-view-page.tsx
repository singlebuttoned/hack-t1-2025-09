import { notFound } from 'next/navigation';

import { fakeProducts } from '@/backend/mock-api';

import ProductForm from './product-form';

type TProductViewPageProps = {
  productId: string;
};

export default async function ProductViewPage({
  productId
}: TProductViewPageProps) {
  let product = null;
  let pageTitle = 'Create New Product';

  if (productId !== 'new') {
    const data = await fakeProducts.getProductById(Number(productId));
    product = data.product;
    if (product === undefined) {
      notFound();
    }
    pageTitle = `Edit Product`;
  }

  return <ProductForm initialData={product} pageTitle={pageTitle} />;
}
