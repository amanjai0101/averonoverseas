import type { APIRoute } from 'astro';
import { getCategories, getProducts, getMaterials } from '../data/index.ts';

export const GET: APIRoute = async ({ site }) => {
  // Use SITE env var first, then Astro's site config, never a hardcoded fallback
  const origin = (
    import.meta.env.SITE_URL ||
    site?.toString() ||
    ''
  ).replace(/\/$/, '');
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  const categories = await getCategories();
  const allProducts = await getProducts();
  const materials = await getMaterials();

  // Product names per category for type labels
  const catProductNames = new Map<string, string[]>();
  for (const p of allProducts) {
    const list = catProductNames.get(p.category) ?? [];
    list.push(p.name.replace(/\s*\(.*?\)\s*/g, '').trim());
    catProductNames.set(p.category, list);
  }

  // Category lines with product-type list + URL
  const catLines = categories.map(c => {
    const types = catProductNames.get(c.slug)?.join(' · ') ?? '';
    const url = c.slug === 'raw-materials'
      ? `${origin}${base}/raw-materials/`
      : `${origin}${base}/products/${c.slug}/`;
    return `- ${c.name}: ${url}\n  Types: ${types || 'see page'}`;
  });

  // Product lines with variant sizes
  const productLines = allProducts.map(p => {
    const variantSizes = p.variants
      .filter(v => v.label && v.label !== 'to-verify')
      .map(v => v.label)
      .join(', ');
    const range = p.sizeRange && p.sizeRange !== 'to-verify' ? p.sizeRange : variantSizes;
    return `- ${p.name}${range ? ` (${range})` : ''}: ${origin}${base}/products/${p.category}/${p.slug}/`;
  });

  // Raw material groups with items
  const matLines = materials.map(m => {
    const itemsByCategory = new Map<string, string[]>();
    for (const item of m.items) {
      const cat = item.category ?? 'General';
      const list = itemsByCategory.get(cat) ?? [];
      list.push(item.name);
      itemsByCategory.set(cat, list);
    }
    const itemDetails = [...itemsByCategory.entries()]
      .map(([cat, names]) => `  ${cat}: ${names.join(', ')}`)
      .join('\n');
    return `### ${m.name}\nGrades: ${m.grades.join(', ')}\n${itemDetails}`;
  });

  const txt = `# Averon Overseas

Averon Overseas is a sourcing and supply company for pharmaceutical primary packaging and raw materials, based in Jaipur, Rajasthan 302012, India.

We connect pharmaceutical manufacturers and brand owners with qualified manufacturing partners. Documentation (CoA, TDS, SDS, drawings, specifications) is shared on request. Specifications are indicative; final specifications are confirmed with the supplier at order stage.

## What we source

### Primary packaging categories
${catLines.join('\n\n')}

### All products with size ranges
${productLines.join('\n')}

## Pharma raw materials
${matLines.join('\n\n')}

## Contact
Email: info@averonoverseas.com
Phone: +91-85911-04074, +91-70738-57555
Address: Jaipur, Rajasthan 302012, India
Website: ${origin}${base}/

## Note
Specifications are indicative. Controlled substances are not listed and are supplied only to licensed buyers subject to applicable law.
`;

  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
