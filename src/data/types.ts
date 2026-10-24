export interface Category {
  slug: string;
  name: string;
  summary: string;       // max 160 chars
  order: number;         // unique, ascending sort key
  image: string;         // filename ending in .webp or .avif
  seoTitle: string;      // max 60 chars
  seoDescription: string; // max 155 chars
}

export interface ProductSpec {
  key: string;
  value: string;
  tol?: string;
  unit: string;
}

export interface ProductVariant {
  label: string;
  status?: 'verified' | 'to-verify';
  docRef?: string;
  attrs: Record<string, string | number>;
  specs?: ProductSpec[];  // per-variant specs (backward-compatible)
}

export interface Product {
  slug: string;
  category: string;
  name: string;
  summary: string;       // max 160 chars
  materials: string[];
  variants: ProductVariant[];
  specs: ProductSpec[];  // top-level specs (used when variants share the same specs)
  sizeRange: string;
  colours: string[];
  standards: string[];
  docs: string[];
  images: string[];
  status: 'verified' | 'to-verify';
  tags: string[];
  docRef?: string;       // document reference number if applicable
}

export interface MaterialItem {
  name: string;
  category?: string;     // sub-category within the group (e.g. therapeutic category for APIs)
}

export interface RawMaterial {
  slug: string;
  name: string;
  group: 'apis' | 'excipients' | 'vitamins-minerals' | 'chemicals';
  items: MaterialItem[];
  grades: string[];
  docs: string[];
}
