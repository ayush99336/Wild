import path from 'path';
import fs from 'fs';
import { filterByHours, rankAuthors, rankTopics, Article } from './rank';

async function main() {
  const filePath = path.join(__dirname, '..', '..', 'data', 'cointelegraph-latest.json');
  if (!fs.existsSync(filePath)) {
    console.error(`CoinTelegraph data not found at ${filePath}`);
    process.exit(1);
  }

  const articles: Article[] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const recent = filterByHours(articles, 48);

  console.log(`\n=== CoinTelegraph (${recent.length} recent articles) ===`);
  console.log('Top Authors:', rankAuthors(recent).slice(0, 5));
  console.log('Top Topics:', rankTopics(recent).slice(0, 5));
}

main();
