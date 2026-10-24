import type { APIRoute } from 'astro';
import { getCategories, getProducts, getMaterials } from '../data/index.ts';

export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const origin = (site?.toString() ?? 'https://averonoverseas.github.io').replace(/\/$/, '');

  const categories = await getCategories();
  const allProducts = await getProducts();
  const materials = await getMaterials();

  // Compute first sizeRange per category
  const catRanges = new Map<string, string>();
  for (const p of allProducts) {
    if (!catRanges.has(p.category) && p.sizeRange && p.sizeRange !== 'to-verify') {
      catRanges.set(p.category, p.sizeRange);
    }
  }

  const catLines = categories.map(c => {
    const range = catRanges.get(c.slug) ? ` (${catRanges.get(c.slug)})` : '';
    return `- ${c.name}${range}: ${origin}${base}/products/${c.slug}/`;
  });

  const matLines = materials.map(m => `- ${m.name}: ${m.grades.join(', ')}`);

  const txt = `# Averon Overseas

Averon Overseas is a sourcing and supply company for pharmaceutical primary packaging and raw materials, based in Jaipur, Rajasthan 302012, India.

We connect pharmaceutical manufacturers and brand owners with qualified manufacturing partners. Documentation (CoA, TDS, SDS, drawings, specifications) is shared on request. Specifications are indicative; final specifications are confirmed with the supplier at order stage.

## What we source

### Primary packaging
${catLines.join('\n')}

### Pharma raw materials (APIs, excipients, vitamins, chemicals)
${matLines.join('\n')}

## All products
${origin}${base}/products/

## Raw materials
${origin}${base}/raw-materials/

## Contact
Email: info@averonoverseas.com
Phone: +91-85911-04074, +91-70738-57555
Address: Jaipur, Rajasthan 302012, India

## Note
Specifications are indicative. Controlled substances are not listed and are supplied only to licensed buyers subject to applicable law.
`;

  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
