import type { APIRoute } from 'astro';
import { getCategories, getProducts } from '../data/index.ts';

export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const origin = (site?.toString() ?? 'https://averonoverseas.github.io').replace(/\/$/, '');

  const categories = await getCategories();
  const allProducts = await getProducts();
  const catMap = new Map(categories.map(c => [c.slug, c.name]));

  const feed = allProducts.map(p => ({
    name: p.name,
    category: catMap.get(p.category) ?? p.category,
    categorySlug: p.category,
    summary: p.summary,
    materials: p.materials,
    sizeRange: p.sizeRange !== 'to-verify' ? p.sizeRange : null,
    colours: p.colours,
    docs: p.docs,
    url: `${origin}${base}/products/${p.category}/${p.slug}/`,
  }));

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
