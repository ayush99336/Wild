import { useState, useEffect } from 'react';
import type { RankingItem, AirdropRequest } from '../types';
import { newsApi } from '../api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Target, Loader2, Crown, Medal, Award } from 'lucide-react';

export function RankingsView() {
  const [authors, setAuthors] = useState<RankingItem[]>([]);
  const [topics, setTopics] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [airdropping, setAirdropping] = useState<string | null>(null);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      setLoading(true);
      setError(null);
      const [authorsData, topicsData] = await Promise.all([
        newsApi.getTopAuthors(),
        newsApi.getTopTopics(),
      ]);
      setAuthors(authorsData);
      setTopics(topicsData);
    } catch (err) {
      setError('Failed to load rankings.');
      console.error('Error loading rankings:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerAirdrop = async (type: 'author' | 'topic', name: string) => {
    try {
      setAirdropping(`${type}-${name}`);
      const request: AirdropRequest = { type, name };
      const result = await newsApi.triggerAirdrop(request);
      
      if (result.onChainTx) {
        alert(`🎉 NFT minted successfully!\n\nToken ID: ${result.tokenId}\nTransaction: ${result.onChainTx}\n\nView on Etherscan: https://sepolia.etherscan.io/tx/${result.onChainTx}`);
      } else {
        alert(`Airdrop logged (simulation). ID: ${result.id}`);
      }
    } catch (err) {
      alert('Airdrop failed. Check console for details.');
      console.error('Airdrop error:', err);
    } finally {
      setAirdropping(null);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 1: return <Medal className="h-5 w-5 text-gray-400" />;
      case 2: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">{index + 1}</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading rankings...</span>
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
    <div className="space-y-8">
      {/* Top Authors Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Top Authors</h2>
        </div>
        <p className="text-muted-foreground">Most prolific writers in the last 48 hours</p>
        
        <div className="grid gap-4">
          {authors.slice(0, 5).map((author, index) => (
            <Card key={author.name} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                  {getRankIcon(index)}
                  <div className="space-y-1">
                    <p className="font-medium leading-none">{author.name}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{author.count} articles</Badge>
                      {index === 0 && <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">Top Author</Badge>}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => triggerAirdrop('author', author.name)}
                  disabled={airdropping === `author-${author.name}`}
                  size="sm"
                  className="ml-4"
                >
                  {airdropping === `author-${author.name}` ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Trophy className="mr-2 h-4 w-4" />
                      Airdrop NFT
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Top Topics Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Target className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold tracking-tight">Top Topics</h2>
        </div>
        <p className="text-muted-foreground">Most mentioned topics in recent articles</p>
        
        <div className="grid gap-4">
          {topics.slice(0, 5).map((topic, index) => (
            <Card key={topic.name} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center space-x-4">
                  {getRankIcon(index)}
                  <div className="space-y-1">
                    <p className="font-medium leading-none capitalize">{topic.name}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{topic.count} mentions</Badge>
                      {index === 0 && <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400">Trending</Badge>}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => triggerAirdrop('topic', topic.name)}
                  disabled={airdropping === `topic-${topic.name}`}
                  size="sm"
                  variant="outline"
                  className="ml-4"
                >
                  {airdropping === `topic-${topic.name}` ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Minting...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-4 w-4" />
                      Airdrop NFT
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {(authors.length === 0 && topics.length === 0) && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              🏆
            </div>
            <CardTitle className="mt-4">No rankings available</CardTitle>
            <CardDescription className="mt-2">
              No ranking data found. Make sure articles are being scraped.
            </CardDescription>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
