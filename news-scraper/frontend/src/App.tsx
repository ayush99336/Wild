import { useState } from 'react';
import { ArticlesView } from './components/ArticlesView';
import { RankingsView } from './components/RankingsView';
import { TxLogView } from './components/TxLogView';
import { Web3View } from './components/Web3View';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import './App.css';
import { Newspaper, Trophy, ListOrdered, Link2 } from 'lucide-react';
import { OnChainTxView } from './components/OnChainTxView';
type TabType = 'articles' | 'rankings' | 'transactions' | 'web3'|'onchain';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('articles');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/60 shadow-sm">
        <div className="container flex flex-col items-center justify-center py-6 gap-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/90 text-primary-foreground text-2xl shadow">
              <Newspaper className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-center">Wildnet News</h1>
              <p className="text-sm text-muted-foreground text-center">Blockchain-powered NFT rewards</p>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1 mt-1">
            <span className="h-2 w-2 rounded-full bg-green-500 inline-block"></span>
            Live
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <span>🏗️ Dashboard</span>
              </CardTitle>
              <CardDescription>
                CoinTelegraph articles with smart contract-based NFT airdrops
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(value: string) => setActiveTab(value as TabType)}
                className="w-full"
              >
                <TabsList className="flex justify-center gap-2 mb-6 bg-muted rounded-lg p-1 shadow-sm">
                  <TabsTrigger value="articles" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Newspaper className="h-5 w-5" />
                    <span className="hidden sm:inline">Articles</span>
                  </TabsTrigger>
                  <TabsTrigger value="rankings" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Trophy className="h-5 w-5" />
                    <span className="hidden sm:inline">Rankings</span>
                  </TabsTrigger>
                  <TabsTrigger value="transactions" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <ListOrdered className="h-5 w-5" />
                    <span className="hidden sm:inline">Transactions</span>
                  </TabsTrigger>
                  <TabsTrigger value="web3" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Link2 className="h-5 w-5" />
                    <span className="hidden sm:inline">My NFTs</span>
                  </TabsTrigger>
                  <TabsTrigger value="onchain" className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
    <ListOrdered className="h-5 w-5" />
    <span className="hidden sm:inline">On-Chain Events</span>
  </TabsTrigger>  
                </TabsList>

                <div className="min-h-[600px]">
                  <TabsContent value="articles" className="space-y-4">
                    <ArticlesView />
                  </TabsContent>
                  <TabsContent value="rankings" className="space-y-4">
                    <RankingsView />
                  </TabsContent>
                  <TabsContent value="transactions" className="space-y-4">
                    <TxLogView />
                  </TabsContent>
                  <TabsContent value="web3" className="space-y-4">
                    <Web3View />
                  </TabsContent>
                    <TabsContent value="onchain" className="space-y-4">
    <OnChainTxView />
  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur dark:bg-slate-900/50">
        <div className="container flex h-14 items-center justify-center px-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>Backend API:</span>
            <Badge variant="outline" className="font-mono">
              http://localhost:4000
            </Badge>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Make sure the news scraper server is running</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
