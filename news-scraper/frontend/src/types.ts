// API types matching the backend
export interface Article {
  title: string;
  url: string;
  category: string | null;
  author: string | null;
  publishedAt: string;
}

export interface RankingItem {
  name: string;
  count: number;
}

export interface SimTx {
  id: string;
  type: 'author' | 'topic';
  name: string;
  timestamp: number;
  onChainTx?: string | null;
  tokenId?: number | null;
}

export interface AirdropRequest {
  type: 'author' | 'topic';
  name: string;
}

export interface AirdropResponse extends SimTx {
  onChainTx: string | null;
  tokenId: number | null;
}
