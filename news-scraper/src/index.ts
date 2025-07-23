import fs from 'fs';
import path from 'path';
import { scrapeCoinTelegraph, enrichCoinTelegraph } from './scrape/cointelegraph';

async function main() {
  let ct = await scrapeCoinTelegraph(48);
  // Only enrich those missing author/category if you really need it
  const needEnrich = ct.filter(a => !a.author);
  if (needEnrich.length) {
    const enriched = await enrichCoinTelegraph(needEnrich);
    // merge back
    const map = new Map(ct.map(a => [a.url, a]));
    enriched.forEach(e => map.set(e.url, e));
    ct = Array.from(map.values());
  }

  const out = path.join(__dirname, '..', 'data', 'cointelegraph-latest.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(ct, null, 2));
  console.log(`Saved ${ct.length} CoinTelegraph articles → ${out}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
