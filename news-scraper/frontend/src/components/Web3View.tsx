import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './Web3View.css';

interface NFT {
  tokenId: number;
  owner: string;
  tokenURI: string;
  winnerType: string;
  winnerValue: string;
}

const CONTRACT_ADDRESS = '0x47C614427e88CDCd9DA463C7d6BE7a645E0E2328';
const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex

export function Web3View() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          setChainId(chainId);
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask to interact with NFTs.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(chainId);
      
      if (chainId !== SEPOLIA_CHAIN_ID) {
        await switchToSepolia();
      }
    } catch (err: any) {
      setError(`Failed to connect wallet: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const switchToSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      setChainId(SEPOLIA_CHAIN_ID);
    } catch (err: any) {
      if (err.code === 4902) {
        // Chain not added to MetaMask
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: SEPOLIA_CHAIN_ID,
            chainName: 'Sepolia Testnet',
            nativeCurrency: { name: 'SepoliaETH', symbol: 'SEP', decimals: 18 },
            rpcUrls: ['https://sepolia.infura.io/v3/'],
            blockExplorerUrls: ['https://sepolia.etherscan.io/'],
          }],
        });
      }
    }
  };

  const loadNFTs = async () => {
    if (!account) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        [
          'function balanceOf(address owner) view returns (uint256)',
          'function tokenURI(uint256 tokenId) view returns (string)',
          'function ownerOf(uint256 tokenId) view returns (address)',
          'event RewardMinted(address indexed to, uint256 indexed tokenId, string winnerType, string winnerValue, bytes32 batchHash, string batchUri)'
        ],
        provider
      );

      // Get balance first to see if user has any NFTs
      const balance = await contract.balanceOf(account);
      console.log(`User balance: ${balance}`);
      
      if (Number(balance) === 0) {
        setNfts([]);
        return;
      }

      // Get recent RewardMinted events filtered by user address
      const filter = contract.filters.RewardMinted(account); // Filter by 'to' address
      const events = await contract.queryFilter(filter, -10000); // Last 10k blocks
      
      console.log(`Found ${events.length} mint events for user`);

      const nftList: NFT[] = [];

      for (const event of events) {
        const eventLog = event as ethers.EventLog;
        if (eventLog.args) {
          const tokenId = Number(eventLog.args.tokenId);
          
          try {
            // Verify user still owns this token
            const currentOwner = await contract.ownerOf(tokenId);
            if (currentOwner.toLowerCase() === account.toLowerCase()) {
              const tokenURI = await contract.tokenURI(tokenId);
              
              nftList.push({
                tokenId,
                owner: account,
                tokenURI,
                winnerType: eventLog.args.winnerType,
                winnerValue: eventLog.args.winnerValue,
              });
            }
          } catch (err) {
            console.log(`Token ${tokenId} may have been burned or transferred`);
          }
        }
      }

      setNfts(nftList);
    } catch (err: any) {
      setError(`Failed to load NFTs: ${err.message}`);
      console.error('Error loading NFTs:', err);
    } finally {
      setLoading(false);
    }
  };

  const isCorrectChain = chainId === SEPOLIA_CHAIN_ID;

  return (
    <div className="web3-view">
      <div className="web3-header">
        <h2>🔗 Blockchain NFTs</h2>
        <div className="contract-info">
          <p>Contract: <a href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer">
            {CONTRACT_ADDRESS}
          </a></p>
          <p>Network: Sepolia Testnet</p>
        </div>
      </div>

      {!account ? (
        <div className="connect-wallet">
          <h3>Connect Your Wallet</h3>
          <p>Connect your MetaMask wallet to view your NFT rewards</p>
          <button onClick={connectWallet} disabled={loading} className="connect-btn">
            {loading ? 'Connecting...' : '🦊 Connect MetaMask'}
          </button>
        </div>
      ) : (
        <div className="wallet-connected">
          <div className="wallet-info">
            <h3>Wallet Connected</h3>
            <p><strong>Address:</strong> {account}</p>
            <p><strong>Network:</strong> {isCorrectChain ? '✅ Sepolia' : '❌ Wrong Network'}</p>
            
            {!isCorrectChain && (
              <button onClick={switchToSepolia} className="switch-network-btn">
                Switch to Sepolia
              </button>
            )}
          </div>

          {isCorrectChain && (
            <div className="nft-section">
              <div className="nft-header">
                <h3>Your NFT Rewards ({nfts.length})</h3>
                <button onClick={loadNFTs} disabled={loading} className="load-nfts-btn">
                  {loading ? 'Loading...' : '🔄 Refresh NFTs'}
                </button>
              </div>

              {error && <div className="error">{error}</div>}

              <div className="nfts-grid">
                {nfts.map((nft) => (
                  <div key={nft.tokenId} className="nft-card">
                    <div className="nft-header">
                      <h4>NFT #{nft.tokenId}</h4>
                      <span className={`nft-type ${nft.winnerType}`}>
                        {nft.winnerType.toUpperCase()}
                      </span>
                    </div>
                    <div className="nft-content">
                      <p><strong>Reward For:</strong> {nft.winnerValue}</p>
                      {nft.tokenURI && (
                        <p><strong>Metadata:</strong> 
                          <a href={nft.tokenURI} target="_blank" rel="noopener noreferrer">
                            View JSON
                          </a>
                        </p>
                      )}
                    </div>
                    <div className="nft-links">
                      <a 
                        href={`https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${nft.tokenId}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="etherscan-link"
                      >
                        View on Etherscan
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {nfts.length === 0 && !loading && (
                <div className="no-nfts">
                  <p>You don't have any NFT rewards yet.</p>
                  <p>Go to the Rankings tab and click "Airdrop NFT" to mint your first reward!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
