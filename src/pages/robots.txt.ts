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
 * @param siteUrl - The canonical site URL. Trailing slash is stripped before use.
 * @returns A robots.txt-formatted string with wildcard stanza, individual bot
 *          stanzas, and a Sitemap directive pointing to sitemap-index.xml.
 */
export function buildRobotsTxt(siteUrl: string): string {
  const origin = siteUrl.replace(/\/$/, '');

  const wildcardStanza = 'User-agent: *\nAllow: /';

  const botStanzas = BOTS.map((bot) => `User-agent: ${bot}\nAllow: /`).join('\n\n');

  const sitemapLine = `Sitemap: ${origin}/sitemap-index.xml`;

  return `${wildcardStanza}\n\n${botStanzas}\n\n${sitemapLine}\n`;
}

export const GET: APIRoute = ({ site }) => {
  const siteUrl =
    site?.toString().replace(/\/$/, '') ?? 'https://averonoverseas.github.io';

  return new Response(buildRobotsTxt(siteUrl), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
