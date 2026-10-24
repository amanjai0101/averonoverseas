# DEPLOY.md — Launch checklist for averonoverseas.com

## 1. GitHub repository secrets and variables

### Repository Secrets (Settings → Secrets and variables → Actions → Secrets)
| Secret | Value |
|---|---|
| `PUBLIC_WEB3FORMS_KEY` | Your Web3Forms access key (from web3forms.com) |
| `PUBLIC_GOATCOUNTER_CODE` | Your GoatCounter site code (e.g. `averon`) |
| `CUSTOM_DOMAIN` | `www.averonoverseas.com` (triggers CNAME file creation) |

### Repository Variables (Settings → Secrets and variables → Actions → Variables)
| Variable | Pre-launch | Post-launch |
|---|---|---|
| `SITE_URL` | `https://averonoverseas.github.io` | `https://www.averonoverseas.com` |
| `BASE_PATH` | `/averonoverseas` | `/` |
| `PUBLIC_INDEXABLE` | `false` | `true` |

---

## 2. DNS records for GitHub Pages (at your domain registrar)

### For apex domain (averonoverseas.com):
```
A    @    185.199.108.153
A    @    185.199.109.153
A    @    185.199.110.153
A    @    185.199.111.153
```

### For www subdomain:
```
CNAME    www    averonoverseas.github.io
```

---

## 3. GitHub Pages settings

1. Go to **Settings → Pages**
2. Set **Source** to **GitHub Actions**
3. Add custom domain: `www.averonoverseas.com`
4. Check **Enforce HTTPS** (after DNS propagates)

---

## 4. Search Console + Bing Webmaster

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add property → URL prefix: `https://www.averonoverseas.com`
3. Verify via HTML meta tag: add `PUBLIC_GOOGLE_VERIFICATION` var and render in `<head>` in `Base.astro`
4. Submit sitemap: `https://www.averonoverseas.com/sitemap-index.xml`
5. Repeat at [bing.com/webmasters](https://www.bing.com/webmasters) — use the Google Search Console import

---

## 5. Launch sequence

1. Add DNS records (allow 24–48 h to propagate)
2. Set `CUSTOM_DOMAIN` secret → push to main → `public/CNAME` is written automatically
3. Enable GitHub Pages custom domain and HTTPS
4. Set `SITE_URL=https://www.averonoverseas.com`, `BASE_PATH=/`, `PUBLIC_INDEXABLE=true`
5. Push to main → CI builds with new settings → site goes live at custom domain with indexing on
6. Verify `robots.txt` at `https://www.averonoverseas.com/robots.txt` shows `Allow: /`
7. Submit sitemap in Search Console and Bing Webmaster
8. Check GoatCounter dashboard for traffic data

---

## 6. Local development

```bash
cp .env.example .env   # fill in your keys
npm install
npm run dev
```
