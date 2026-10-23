import type { APIRoute } from 'astro';

const BOTS = [
  'Googlebot',
  'Bingbot',
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
  'PerplexityBot',
  'CCBot',
] as const;

/**
 * Builds the robots.txt content string.
 *
 * @param siteUrl  - The canonical site origin (no trailing slash).
 * @param basePath - The base path prefix (e.g. '/averonoverseas' or '').
 * @returns A robots.txt-formatted string with wildcard stanza, individual bot
 *          stanzas, and a Sitemap directive pointing to sitemap-index.xml.
 */
export function buildRobotsTxt(siteUrl: string, basePath = ''): string {
  const origin = siteUrl.replace(/\/$/, '');
  const base   = basePath === '/' ? '' : basePath.replace(/\/$/, '');

  const wildcardStanza = 'User-agent: *\nAllow: /';
  const botStanzas = BOTS.map((bot) => `User-agent: ${bot}\nAllow: /`).join('\n\n');
  const sitemapLine = `Sitemap: ${origin}${base}/sitemap-index.xml`;

  return `${wildcardStanza}\n\n${botStanzas}\n\n${sitemapLine}\n`;
}

export const GET: APIRoute = ({ site }) => {
  const siteUrl  = site?.toString().replace(/\/$/, '') ?? 'https://amanjai0101.github.io';
  // Read BASE_PATH from the environment; fall back to '/averonoverseas'.
  const basePath = import.meta.env.BASE_URL ?? '/averonoverseas';

  return new Response(buildRobotsTxt(siteUrl, basePath), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
