import type { APIRoute } from 'astro';
import { getCategories, getProducts } from '../data/index.ts';

export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const origin = (site?.toString() ?? 'https://averonoverseas.github.io').replace(/\/$/, '');

  const categories = await getCategories();
  const allProducts = await getProducts();

  const catMap = new Map(categories.map(c => [c.slug, c.name]));

  const sections = allProducts.map(p => {
    const lines = [
      `## ${p.name}`,
      `Category: ${catMap.get(p.category) ?? p.category}`,
      `URL: ${origin}${base}/products/${p.category}/${p.slug}/`,
      `Summary: ${p.summary}`,
    ];
    if (p.materials.length) lines.push(`Materials: ${p.materials.join(', ')}`);
    if (p.sizeRange && p.sizeRange !== 'to-verify') lines.push(`Size range: ${p.sizeRange}`);
    if (p.colours.length) lines.push(`Colours: ${p.colours.join(', ')}`);
    if (p.docs.length) lines.push(`Documents available on request: ${p.docs.join(', ')}`);
    return lines.join('\n');
  });

  const txt = `# Averon Overseas — Full Product List

Averon Overseas, Jaipur, Rajasthan 302012, India.
Contact: info@averonoverseas.com | +91-85911-04074

Specifications are indicative; final specifications confirmed with supplier at order stage.

---

${sections.join('\n\n')}
`;

  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
