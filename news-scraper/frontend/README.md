# Wildnet News Scraper Frontend

A React TypeScript frontend for the news scraper blockchain application. This dashboard allows you to view recent CoinTelegraph articles, see author/topic rankings, and trigger NFT airdrops for top performers.

## Features

- **📰 Articles View**: Browse recent articles from CoinTelegraph (last 48 hours)
- **🏆 Rankings View**: See top authors and topics with airdrop functionality
- **📋 Transaction Log**: View all simulated and on-chain transactions

## Tech Stack

- React 18 with TypeScript
- Vite for fast development and building
- Axios for API communication
- Modern CSS with responsive design

## Prerequisites

- Node.js 18+ 
- The news scraper backend running on `http://localhost:4000`

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

## Backend Integration

This frontend communicates with the news scraper backend API:

- **GET /articles** - Recent articles (last 48h)
- **GET /rank/authors** - Top authors by article count  
- **GET /rank/topics** - Top topics by keyword frequency
- **POST /airdrop** - Trigger NFT mint for winners
- **GET /txlog** - View transaction history

Make sure the backend server is running before using the frontend.

## Usage

1. **View Articles**: Click the "Articles" tab to see recent scraped articles
2. **Check Rankings**: Use the "Rankings" tab to see top authors and topics
3. **Trigger Airdrops**: Click the "Airdrop NFT" buttons to mint rewards for winners
4. **Monitor Transactions**: View all activity in the "Transactions" tab

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Project Structure

```
src/
├── components/          # React components
│   ├── ArticlesView.tsx # Display articles
│   ├── RankingsView.tsx # Rankings and airdrops
│   └── TxLogView.tsx    # Transaction log
├── api.ts              # API service functions
├── types.ts            # TypeScript interfaces
├── App.tsx             # Main app component
└── main.tsx            # App entry point
```
