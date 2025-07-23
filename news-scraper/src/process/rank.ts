// src/process/rank.ts
import dayjs from 'dayjs';

export interface Article {
  title: string;
  url: string;
  category: string | null;
  author: string | null;
  publishedAt: string;
}

// naive keyword list – expand later
const TOPIC_KEYWORDS = [
  'bitcoin', 'ethereum', 'solana', 'defi', 'nft', 'stablecoin', 'etf',
  'layer 2', 'arbitrum', 'polkadot', 'cardano', 'ai', 'memecoin'
];

export function filterByHours(articles: Article[], hours = 48) {
  return articles.filter(a => dayjs().diff(dayjs(a.publishedAt), 'hour') <= hours);
}

export function rankAuthors(articles: Article[]) {
  const map = new Map<string, number>();
  for (const a of articles) {
    if (!a.author) continue;
    map.set(a.author, (map.get(a.author) ?? 0) + 1);
  }
  return toSortedArray(map);
}

export function rankTopics(articles: Article[]) {
  const map = new Map<string, number>();

  for (const a of articles) {
    const lowerTitle = a.title.toLowerCase();
    for (const key of TOPIC_KEYWORDS) {
      if (lowerTitle.includes(key)) {
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
  }
  return toSortedArray(map);
}

function toSortedArray(map: Map<string, number>) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}
