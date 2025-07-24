import { useState, useEffect } from 'react';
import type { Article } from '../types';
import { newsApi } from '../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, ExternalLink, Calendar, User, Tag } from 'lucide-react';

export function ArticlesView() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await newsApi.getArticles();
      setArticles(data);
    } catch (err) {
      setError('Failed to load articles. Make sure the backend is running on port 4000.');
      console.error('Error loading articles:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading articles...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recent Articles</h2>
          <p className="text-muted-foreground">
            Latest CoinTelegraph articles ({articles.length} found)
          </p>
        </div>
        <Button onClick={loadArticles} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Articles Grid */}
      <div className="grid gap-4">
        {articles.map((article, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-lg leading-tight">
                  <a 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors line-clamp-2"
                  >
                    {article.title}
                  </a>
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {article.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{article.author}</span>
                  </div>
                )}
                {article.category && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {article.category}
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(article.publishedAt).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {articles.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              📰
            </div>
            <CardTitle className="mt-4">No articles found</CardTitle>
            <CardDescription className="mt-2">
              No recent articles available. Try refreshing or check if the backend is running.
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
