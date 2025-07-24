  // Trigger backend scraping and processing

import axios from 'axios';
import type { Article, RankingItem, AirdropRequest, AirdropResponse, SimTx } from './types';

const API_BASE = 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60 seconds for on-chain transactions
});

export const newsApi = {
  // Get recent articles (last 48h)
  getArticles: async (): Promise<Article[]> => {
    const response = await api.get('/articles');
    return response.data;
  },

  // Get top authors ranking
  getTopAuthors: async (): Promise<RankingItem[]> => {
    const response = await api.get('/rank/authors');
    return response.data;
  },

  // Get top topics ranking  
  getTopTopics: async (): Promise<RankingItem[]> => {
    const response = await api.get('/rank/topics');
    return response.data;
  },

  // Trigger NFT airdrop
  triggerAirdrop: async (request: AirdropRequest): Promise<AirdropResponse> => {
    const response = await api.post('/airdrop', request);
    return response.data;
  },

  // Get transaction log
  getTxLog: async (): Promise<SimTx[]> => {
    const response = await api.get('/txlog');
    return response.data;
  },

  // Trigger backend scraping and processing
  scrapeAndProcess: async (): Promise<any> => {
    const response = await api.post('/scrape');
    return response.data;
  },
};
