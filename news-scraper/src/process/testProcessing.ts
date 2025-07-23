import path from 'path';
import fs from 'fs';
import { filterByHours, rankAuthors, rankTopics, Article } from './rank';

async function main() {
  const dataDir = path.join(__dirname, '..', '..', 'data');
  const sources: [string, string][] = [
    ['CoinTelegraph', path.join(dataDir, 'cointelegraph-latest.json')],
    ['CryptoSlate', path.join(dataDir, 'cryptoslate.json')],
  ];

  for (const [sourceName, filePath] of sources) {
    if (!fs.existsSync(filePath)) {
      console.warn(`${sourceName} data not found at ${filePath}, skipping.`);
      continue;
    }
    const articles: Article[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const recent = filterByHours(articles, 48);
    console.log(`\n=== ${sourceName} (${recent.length} recent articles) ===`);
    console.log('Top Authors:', rankAuthors(recent).slice(0, 5));
    console.log('Top Topics:', rankTopics(recent).slice(0, 5));
  }
}

main();
