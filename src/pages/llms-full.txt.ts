import type { APIRoute } from 'astro';
import { getCategories, getProducts, getMaterials } from '../data/index.ts';

export const GET: APIRoute = async ({ site }) => {
  const origin = (
    import.meta.env.SITE_URL ||
    site?.toString() ||
    ''
  ).replace(/\/$/, '');
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  const categories = await getCategories();
  const allProducts = await getProducts();
  const materials = await getMaterials();
  const catMap = new Map(categories.map(c => [c.slug, c.name]));

  // Product sections with variant sizes
  const productSections = allProducts.map(p => {
    const lines = [
      `## ${p.name}`,
      `Category: ${catMap.get(p.category) ?? p.category}`,
      `URL: ${origin}${base}/products/${p.category}/${p.slug}/`,
      `Summary: ${p.summary}`,
    ];
    if (p.materials.length) lines.push(`Materials: ${p.materials.join(', ')}`);
    if (p.sizeRange && p.sizeRange !== 'to-verify') lines.push(`Size range: ${p.sizeRange}`);
    // List all variant labels as available sizes
    const variantLabels = p.variants
      .filter(v => v.label && v.label !== 'to-verify')
      .map(v => v.label);
    if (variantLabels.length) lines.push(`Variants: ${variantLabels.join(' | ')}`);
    if (p.colours.length) lines.push(`Colours: ${p.colours.join(', ')}`);
    if (p.docs.length) lines.push(`Documents on request: ${p.docs.join(', ')}`);
    return lines.join('\n');
  });

  // Raw material sections grouped by sub-category
  const matSections = materials.map(m => {
    const grouped = new Map<string, string[]>();
    for (const item of m.items) {
      const cat = item.category ?? 'General';
      (grouped.get(cat) ?? grouped.set(cat, []).get(cat)!).push(item.name);
    }
    const detail = [...grouped.entries()]
      .map(([cat, names]) => `  ${cat}:\n    ${names.join('\n    ')}`)
      .join('\n');
    return `## ${m.name}\nGrades: ${m.grades.join(', ')}\nDocuments: ${m.docs.join(', ')}\n${detail}`;
  });

  const txt = `# Averon Overseas — Full Product & Materials List

Averon Overseas, Jaipur, Rajasthan 302012, India
Contact: info@averonoverseas.com | +91-85911-04074
Website: ${origin}${base}/

Specifications are indicative; final specifications confirmed with supplier at order stage.
Controlled substances are not listed and are supplied only to licensed buyers.

---

# Primary Packaging Products

${productSections.join('\n\n')}

---

# Pharma Raw Materials

${matSections.join('\n\n')}
`;

  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
