import { useState, useEffect } from 'react';
import type { SimTx } from '../types';
import { newsApi } from '../api';
import './TxLogView.css';

export function TxLogView() {
  const [transactions, setTransactions] = useState<SimTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTxLog();
  }, []);

  const loadTxLog = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await newsApi.getTxLog();
      setTransactions(data.sort((a, b) => b.timestamp - a.timestamp));
    } catch (err) {
      setError('Failed to load transaction log.');
      console.error('Error loading tx log:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading transactions...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="txlog-view">
      <div className="header">
        <h2>Transaction Log ({transactions.length})</h2>
        <button onClick={loadTxLog} className="refresh-btn">
          Refresh
        </button>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">
          No transactions yet. Try triggering an airdrop!
        </div>
      ) : (
        <div className="tx-list">
          {transactions.map((tx) => (
            <div key={tx.id} className="tx-item">
              <div className="tx-header">
                <span className={`tx-type ${tx.type}`}>
                  {tx.type === 'author' ? '👤' : '🏷️'} {tx.type}
                </span>
                <span className="tx-time">
                  {new Date(tx.timestamp).toLocaleString()}
                </span>
              </div>
              
              <div className="tx-body">
                <div className="tx-name">
                  <strong>{tx.name}</strong>
                </div>
                
                <div className="tx-details">
                  <div className="tx-id">
                    <small>ID: {tx.id}</small>
                  </div>
                  
                  {tx.onChainTx && (
                    <div className="on-chain-info">
                      <div className="blockchain-badge">
                        ⛓️ On-Chain
                      </div>
                      <div className="tx-hash">
                        <small>
                          Tx: <a 
                            href={`https://sepolia.etherscan.io/tx/${tx.onChainTx}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {tx.onChainTx.slice(0, 10)}...{tx.onChainTx.slice(-8)}
                          </a>
                        </small>
                      </div>
                      {tx.tokenId && (
                        <div className="token-id">
                          <small>NFT Token ID: {tx.tokenId}</small>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!tx.onChainTx && (
                    <div className="sim-badge">
                      🔄 Simulation Only
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
