import axios from 'axios';
import * as cheerio from 'cheerio';
import dayjs from 'dayjs';
import pLimit from 'p-limit';

export interface Article {
  title: string;
  url: string;
  category: string | null;
  author: string | null;
  publishedAt: string; // ISO 8601
}

const BASE = 'https://www.coindesk.com';
const listUrl = (p: number) =>
  p === 1 ? `${BASE}/latest/` : `${BASE}/latest/?page=${p}`;

const limit = pLimit(4);

/**
 * Scrape CoinDesk list pages, stop when items are older than hoursBack or maxPages reached.
 */
export async function scrapeCoinDesk(
  hoursBack = 48,
  maxPages = 5
): Promise<Article[]> {
  const cutoff = dayjs().subtract(hoursBack, 'hour');
  const collected: Article[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const html = await fetchHtml(listUrl(page));
    const $ = cheerio.load(html);

    // Card selector is fairly stable, but we add alternatives
    const cards = $('[data-qa="search-results"] article, article.card, article');
    if (!cards.length) break;

    let hitOld = false;

    cards.each((_, el) => {
      const $el = $(el);

      // Title + URL (try multiple selectors)
      const $link =
        $el.find('a[href][data-qa="card-headline"], a.card-title-link, a');
      const title = $link.text().trim();
      const relUrl = $link.attr('href') ?? '';
      if (!title || !relUrl) return;

      const url = relUrl.startsWith('http') ? relUrl : BASE + relUrl;

      // Category (on many cards appears as tag or label)
      const category =
        $el.find('[data-qa="card-category"], .category-link, .card__section')
          .first()
          .text()
          .trim() || null;

      // Date is usually in <time datetime="...">
      let rawDate =
        $el.find('time[datetime]').attr('datetime') ||
        $el.find('time').text().trim();

      // If no date, skip (rare)
      if (!rawDate) rawDate = '';

      const published = parseDate(rawDate);
      if (published.isBefore(cutoff)) {
        hitOld = true;
        return;
      }

      collected.push({
        title,
        url,
        category,
        author: null,
        publishedAt: published.toISOString(),
      });
    });

    if (hitOld) break;
    await delay(400);
  }

  return dedupe(collected);
}

/**
 * Enrich with author + exact datetime from article page
 */
export async function enrichCoinDesk(arts: Article[]): Promise<Article[]> {
  return Promise.all(
    arts.map((a) =>
      limit(async () => {
        try {
          const html = await fetchHtml(a.url);
          const $ = cheerio.load(html);

          // Author: varies (multiple links or span)
          const author =
            $('[data-qa="author-name"] a, .attribution__name a, .attribution__name')
              .first()
              .text()
              .trim() || null;

          // Precise datetime
          const dt =
            $('time[datetime]').attr('datetime') ||
            $('meta[property="article:published_time"]').attr('content');

          if (dt) a.publishedAt = parseDate(dt).toISOString();
          a.author = author;
        } catch (e: any) {
          console.warn('enrich fail:', a.url, e?.message ?? e);
        }
        return a;
      })
    )
  );
}

/* ---------------- helpers ---------------- */

async function fetchHtml(url: string): Promise<string> {
  const { data } = await axios.get(url, {
    timeout: 15000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
      Accept: 'text/html',
    },
  });
  return data;
}

function parseDate(raw: string): dayjs.Dayjs {
  // raw might already be ISO. Dayjs will handle.
  // Otherwise it could be like: "Jul 23, 2025 at 10:15 a.m. UTC"
  // Dayjs can't parse that format natively, but many pages give ISO in datetime attr.
  // Fallback to now if invalid.
  const d = dayjs(raw);
  return d.isValid() ? d : dayjs();
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function dedupe(arr: Article[]) {
  return Array.from(new Map(arr.map((a) => [a.url, a])).values());
}
