import { fakeProducts } from '@/backend/mock-api';
import { Product } from '@/backend/mock-data';
import { searchParamsCache } from '@/lib/searchparams';

import { ProductTable } from './product-tables';
import { columns } from './product-tables/columns';

export default async function ProductListingPage() {
  // Showcasing the use of search params cache in nested RSCs
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');
  const categories = searchParamsCache.get('category');

  const filters: {
    page?: number;
    limit?: number;
    search?: string;
    categories?: string;
  } = {};

  if (typeof page === 'number' && !Number.isNaN(page)) {
    filters.page = page;
  }
  if (typeof pageLimit === 'number' && !Number.isNaN(pageLimit)) {
    filters.limit = pageLimit;
  }
  if (typeof search === 'string' && search.length > 0) {
    filters.search = search;
  }
  if (typeof categories === 'string' && categories.length > 0) {
    filters.categories = categories;
  }

  const data = await fakeProducts.getProducts(filters);
  const totalProducts = data.total_products;
  const products: Product[] = data.products;

  return (
    <ProductTable
      data={products}
      totalItems={totalProducts}
      columns={columns}
    />
  );
}
