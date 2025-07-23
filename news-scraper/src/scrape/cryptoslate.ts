// src/scrape/cryptoslate.ts
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

const BASE = 'https://cryptoslate.com';
const pageUrl = (p: number) =>
  p === 1 ? `${BASE}/news/` : `${BASE}/news/page/${p}/`;

const limit = pLimit(4); // concurrent detail-requests

/**
 * Scrape list pages, stop when articles are older than hoursBack or maxPages reached.
 */
export async function scrapeCryptoSlate(hoursBack = 48, maxPages = 5): Promise<Article[]> {
  const cutoff = dayjs().subtract(hoursBack, 'hour');
  const all: Article[] = [];

  for (let p = 1; p <= maxPages; p++) {
    const html = await fetchHtml(pageUrl(p));
    const $ = cheerio.load(html);

    const cards = $('section.list-feed .list-card article');
    if (!cards.length) break;

    let hitOld = false;

    cards.each((_, el) => {
      const $el = $(el);
      const title = $el.find('h2').text().trim();
      const relUrl = $el.find('a').attr('href') ?? '';
      const url = relUrl.startsWith('http') ? relUrl : BASE + relUrl;

      const category = $el.find('.post-meta > span').first().text().trim() || null;
      const relTime = $el.find('.post-meta .read').text().trim();
      const publishedAt = parseRelative(relTime).toISOString();

      if (dayjs(publishedAt).isBefore(cutoff)) {
        hitOld = true;
        return; // skip older item
      }

      all.push({ title, url, category, author: null, publishedAt });
    });

    if (hitOld) break;
    await delay(400);
  }

  return dedupe(all);
}

/**
 * Fetch author + exact datetime from each article page.
 */
export async function enrichArticles(arts: Article[]): Promise<Article[]> {
  return Promise.all(
    arts.map((a) =>
      limit(async () => {
        try {
          const html = await fetchHtml(a.url);
          const $ = cheerio.load(html);

          const author =
            $('.single-post__author a, .author-name')
              .first()
              .text()
              .trim() || null;

          const dt = $('time[datetime]').attr('datetime');
          if (dt) a.publishedAt = dayjs(dt).toISOString();

          a.author = author;
        } catch (e: any) {
          console.warn('enrich fail:', a.url, e?.message ?? e);
        }
        return a;
      })
    )
  );
}

/* ----------------- helpers ----------------- */

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

function parseRelative(txt: string): dayjs.Dayjs {
  // e.g. "36 mins ago", "1 hour ago", "2 days ago"
  const m = txt.match(/(\d+)\s*(min|mins?|hour|hours?|day|days?)\s+ago/i);
  if (!m) return dayjs(); // fallback to now
  const num = parseInt(m[1], 10);
  const unit = m[2].startsWith('min')
    ? 'minute'
    : m[2].startsWith('hour')
    ? 'hour'
    : 'day';
  return dayjs().subtract(num, unit as dayjs.ManipulateType);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function dedupe(arr: Article[]) {
  return Array.from(new Map(arr.map((a) => [a.url, a])).values());
}
