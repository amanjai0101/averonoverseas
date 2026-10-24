import type { APIRoute } from 'astro';

// Crawlers to explicitly allow when site is indexable
const ALLOWED_BOTS = [
  'Googlebot', 'Bingbot', 'Slurp',
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot',
  'PerplexityBot', 'Google-Extended',
  'Applebot-Extended', 'CCBot',
];

export function buildRobotsTxt(siteUrl: string, basePath: string, indexable: boolean): string {
  const origin = siteUrl.replace(/\/$/, '');
  const base   = basePath === '/' ? '' : basePath.replace(/\/$/, '');
  const sitemap = `Sitemap: ${origin}${base}/sitemap-index.xml`;

  if (!indexable) {
    // Pre-launch: block all crawlers, still point to sitemap so we can verify it
    return `User-agent: *\nDisallow: /\n\n${sitemap}\n`;
  }

  const wildcard = 'User-agent: *\nAllow: /';
  const bots = ALLOWED_BOTS.map(b => `User-agent: ${b}\nAllow: /`).join('\n\n');
  return `${wildcard}\n\n${bots}\n\n${sitemap}\n`;
}

export const GET: APIRoute = ({ site }) => {
  const siteUrl  = site?.toString().replace(/\/$/, '') ?? 'https://averonoverseas.github.io';
  const basePath = import.meta.env.BASE_URL ?? '/';
  const indexable = import.meta.env.PUBLIC_INDEXABLE === 'true';
  return new Response(buildRobotsTxt(siteUrl, basePath, indexable), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
