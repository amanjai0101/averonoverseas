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
  attrs: Record<string, string | number>;
}

export interface Product {
  slug: string;
  category: string;
  name: string;
  summary: string;       // max 160 chars
  materials: string[];
  variants: ProductVariant[];
  specs: ProductSpec[];
  sizeRange: string;
  colours: string[];
  standards: string[];
  docs: string[];
  images: string[];
  status: 'verified' | 'to-verify';
  tags: string[];
}
