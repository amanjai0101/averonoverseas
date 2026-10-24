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
  specs?: ProductSpec[];
}

export interface Product {
  slug: string;
  category: string;
  name: string;
  summary: string;
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
  docRef?: string;
}

export interface MaterialItem {
  name: string;
  category?: string;
}

export interface RawMaterial {
  slug: string;
  name: string;
  group: 'apis' | 'excipients' | 'vitamins-minerals' | 'chemicals';
  items: MaterialItem[];
  grades: string[];
  docs: string[];
}

export interface DownloadDocument {
  title: string;
  description: string;
  file: string;
  type: string;
  size: string;
  updated: string;
}

export interface SiteAddress {
  street: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  countryCode: string;
}

export interface SiteConfig {
  companyName: string;
  tagline: string;
  description: string;
  address: SiteAddress;
  email: string;
  phones: string[];
  mapEmbedUrl: string;
  mapLinkUrl: string;
}
