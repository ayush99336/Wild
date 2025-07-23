import axios from 'axios';
import axiosRetry from 'axios-retry';
import { XMLParser } from 'fast-xml-parser';
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

const BASE = 'https://cointelegraph.com';
const RSS_URL = `${BASE}/rss`; // main feed
const limit = pLimit(2);       // keep it LOW for HTML enrich

axiosRetry(axios, {
  retries: 3,
  retryCondition: (err) =>
    err.response?.status === 429 || err.code === 'ECONNABORTED',
  retryDelay: (count) => 1000 * Math.pow(2, count), // 1s, 2s, 4s
});

/**
 * Primary scraper via RSS (no 429).
 */
export async function scrapeCoinTelegraph(hoursBack = 48): Promise<Article[]> {
  const cutoff = dayjs().subtract(hoursBack, 'hour');

  const xml = await fetchRss(RSS_URL);
  const items = parseRss(xml);

  const filtered: Article[] = items
    .map((i) => ({
      title: i.title,
      url: i.link,
      category: Array.isArray(i.category) ? i.category[0] : i.category ?? null,
      author: i['dc:creator'] ?? null,
      publishedAt: dayjs(i.pubDate).isValid()
        ? dayjs(i.pubDate).toISOString()
        : dayjs().toISOString(),
    }))
    .filter((a) => dayjs(a.publishedAt).isAfter(cutoff));

  return dedupe(filtered);
}

/**
 * OPTIONAL: Enrich each article using HTML
 * - Pull exact author & datetime if RSS info missing
 * - Use sparingly to avoid 429
 */
export async function enrichCoinTelegraph(arts: Article[]): Promise<Article[]> {
  return Promise.all(
    arts.map((a) =>
      limit(async () => {
        try {
          const html = await fetchHtml(a.url);
          const $ = cheerio.load(html);

          // Author selector
          const author =
            $('[data-test="author-name"], .post-meta__author a, .author-name')
              .first()
              .text()
              .trim() || a.author;

          // Datetime
          const dt =
            $('time[datetime]').attr('datetime') ||
            $('meta[property="article:published_time"]').attr('content');

          if (dt && dayjs(dt).isValid()) a.publishedAt = dayjs(dt).toISOString();
          a.author = author;
        } catch (e: any) {
          console.warn('enrich fail:', a.url, e?.message ?? e);
        }
        await delayRand(); // random cool-down
        return a;
      })
    )
  );
}

/* ---------------- helpers ---------------- */

async function fetchRss(url: string): Promise<string> {
  const { data } = await axios.get(url, {
    timeout: 15000,
    headers: {
      'User-Agent':
        'MyResearchBot/1.0 (+youremail@example.com) Mozilla/5.0 Chrome/125',
      Accept: 'application/rss+xml,text/xml,application/xml,text/html;q=0.9',
    },
  });
  return data;
}

function parseRss(xml: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
  });
  const json = parser.parse(xml);
  // rss.channel.item can be array or single obj
  const items = json?.rss?.channel?.item;
  return Array.isArray(items) ? items : items ? [items] : [];
}

async function fetchHtml(url: string): Promise<string> {
  const { data } = await axios.get(url, {
    timeout: 15000,
    headers: {
      'User-Agent':
        'MyResearchBot/1.0 (+youremail@example.com) Mozilla/5.0 Chrome/125',
      Accept: 'text/html',
    },
  });
  return data;
}

function dedupe(arr: Article[]) {
  return Array.from(new Map(arr.map((a) => [a.url, a])).values());
}

function delayRand(min = 400, max = 1400) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((r) => setTimeout(r, ms));
}
