import type { Category, Product, RawMaterial, DownloadDocument, SiteConfig } from './types';

export type { Category, Product, RawMaterial, DownloadDocument, SiteConfig };

export async function getCategories(): Promise<Category[]> {
  const modules = import.meta.glob('../data/categories/*.json', { eager: true });
  const categories = Object.values(modules).map(m => (m as any).default ?? m) as Category[];
  return categories.sort((a, b) => a.order - b.order);
}

export async function getProducts(categorySlug?: string): Promise<Product[]> {
  const modules = import.meta.glob('../data/products/*.json', { eager: true });
  const products = Object.values(modules).map(m => (m as any).default ?? m) as Product[];
  if (categorySlug === undefined) return products;
  return products.filter(p => p.category === categorySlug);
}

export async function getMaterials(group?: string): Promise<RawMaterial[]> {
  const modules = import.meta.glob('../data/materials/*.json', { eager: true });
  const materials = Object.values(modules).map(m => (m as any).default ?? m) as RawMaterial[];
  if (group === undefined) return materials;
  return materials.filter(m => m.group === group);
}

export async function getDocuments(): Promise<DownloadDocument[]> {
  const mod = await import('../data/documents.json');
  return (mod.default ?? mod) as DownloadDocument[];
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const mod = await import('../data/site.json');
  return (mod.default ?? mod) as SiteConfig;
}
