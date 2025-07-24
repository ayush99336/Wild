<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Wildnet News Scraper Frontend

This is a React TypeScript frontend for the news scraper blockchain application. The app communicates with an Express API backend running on port 4000.

## Key Features
- Display recent articles from CoinTelegraph
- Show author and topic rankings 
- Allow triggering NFT airdrops to top authors/topics
- View transaction logs

## API Endpoints
- GET /articles - Recent articles (last 48h)
- GET /rank/authors - Top authors by article count
- GET /rank/topics - Top topics by keyword frequency
- POST /airdrop - Trigger NFT mint for winner
- GET /txlog - View all transactions

## Tech Stack
- React 18 with TypeScript
- Vite for build tooling
- Modern CSS for styling
- Fetch API for backend communication

When generating code:
- Use functional components with hooks
- Include proper TypeScript types
- Handle loading and error states
- Use modern React patterns
- Keep components focused and reusable
