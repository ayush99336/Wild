// src/types.ts
export interface Article {
  title: string;
  url: string;
  author: string | null;
  publishedAt: string;   // ISO 8601
  shares?: number | null; // CryptoSlate doesn’t expose this; keep for compatibility
  comments?: number | null;
}
