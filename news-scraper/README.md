# News Scraper (CoinTelegraph Focus)

This project scrapes recent articles from CoinTelegraph, ranks authors/topics, and simulates on-chain rewards via a smart contract.

## Project Structure

```plaintext
news-scraper/
├── contracts/             # Solidity contracts (Reward.sol)
├── data/                  # Persisted JSON data (cointelegraph-latest.json, cryptoslate.json, txlog.json)
├── scripts/               # Deployment scripts (deploy.ts)
├── src/
│   ├── process/           # Ranking logic and test processor
│   │   ├── rank.ts        # Filter & ranking functions
│   │   └── testProcessing.ts  # Simple CLI to test processing logic
│   ├── scrape/            # Scrapers & enrichers
│   │   ├── cointelegraph.ts   # Scrape and enrich CoinTelegraph
│   │   └── cryptoslate.ts     # (Optional) CryptoSlate scraper
│   ├── sim/               # Transaction simulation
│   │   └── txlog.ts       # logSimTx, getTxLog
│   ├── server.ts          # Express API (endpoints for articles, ranking, airdrop, txlog)
│   └── index.ts           # CLI to scrape CoinTelegraph and save JSON
├── hardhat.config.ts      # Hardhat config (Sepolia)
├── package.json           # Dependencies & scripts
├── tsconfig.json          # TypeScript config
└── README.md              # Project overview (you are here)
```

## Installation

```bash
npm install
```

## Scripts

- `npm run scrape`  
  Scrape CoinTelegraph articles and save to `data/cointelegraph-latest.json`.

- `npm run process`  
  Run `testProcessing.ts` to filter recent articles and print top authors/topics.

- `npm run serve`  
  Start the Express server on port 4000. Endpoints:
  - `GET /articles`
  - `GET /rank/authors`
  - `GET /rank/topics`
  - `POST /airdrop` (uses sim tx and on-chain reward)
  - `GET /txlog`

- `npm run compile`  
  Compile Hardhat contracts.

- `npm run deploy:sepolia`  
  Deploy `Reward.sol` to Sepolia (requires `SEPOLIA_RPC_URL` and `PRIVATE_KEY`).

## Environment Variables

Create a `.env` file with:

```dotenv
SEPOLIA_RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=0x...
CONTRACT_ADDRESS=deployed_reward_contract_address
```

## Next Steps

- Integrate real NFT/ERC721 contract (Reward.sol)
- Build React dashboard for articles, ranking, and on-chain airdrops
- Deploy frontend and backend to production or test environment
