import type { Category, Product } from './types';

export async function getCategories(): Promise<Category[]> {
  const modules = import.meta.glob('../data/categories/*.json', { eager: true });
  const categories = Object.values(modules).map(m => (m as any).default ?? m) as Category[];
  return categories.sort((a, b) => a.order - b.order);
}

export async function getProducts(categorySlug?: string): Promise<Product[]> {
  const modules = import.meta.glob('../data/products/*.json', { eager: true });
  const products = Object.values(modules).map(m => (m as any).default ?? m) as Product[];

  if (categorySlug === undefined) {
    return products;
  }

  return products.filter(p => p.category === categorySlug);
}
