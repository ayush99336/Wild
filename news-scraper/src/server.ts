
// src/server.ts
import express, { Request, Response } from 'express'
import cors from 'cors'
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { filterByHours, rankAuthors, rankTopics, Article } from './process/rank';
import { logSimTx,getTxLog } from './sim/txlog';
import 'dotenv/config';
import { JsonRpcProvider, Wallet, Contract } from 'ethers';
import { exec } from 'child_process';
const app = express();
// POST /scrape - Run scraping and processing script (one-click automation)
app.post('/scrape', async (_req: Request, res: Response) => {
  console.log('🔄 /scrape endpoint called: starting scraping and processing...');
  const scriptPath = path.join(__dirname, 'index.ts');
  // Use ts-node to run TypeScript directly
  exec(`npx ts-node ${scriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Scrape automation failed:', error, stderr);
      return res.status(500).json({ status: 'error', error: 'Scrape automation failed', details: stderr || error.message });
    }
    console.log('✅ Scrape automation complete:', stdout);
    res.json({ status: 'ok', message: 'Scraping and processing complete', output: stdout });
  });
});

// CORS preflight for /scrape (if needed)
app.options('/scrape', cors());

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server port
  credentials: true
}));

app.use(express.json());

const DATA_DIR = path.join(__dirname, '..', 'data');
const CT_FILE = path.join(DATA_DIR, 'cointelegraph-latest.json');

// Reusable loader
/** Load articles from JSON file */
function loadArticles(): Article[] {
  return JSON.parse(fs.readFileSync(CT_FILE, 'utf8')) as Article[];
}
// On-chain contract setup
const { SEPOLIA_RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS } = process.env;
let nftContract: Contract | null = null;
let contractOwnerAddress: string | null = null;
if (CONTRACT_ADDRESS && SEPOLIA_RPC_URL && PRIVATE_KEY) {
  const provider = new JsonRpcProvider(SEPOLIA_RPC_URL);
  const wallet = new Wallet(PRIVATE_KEY, provider);
  contractOwnerAddress = wallet.address;
  // Load NFTReward ABI
  const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'NFTReward.sol', 'NFTReward.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  nftContract = new Contract(CONTRACT_ADDRESS, artifact.abi, wallet);
}

// GET /articles
app.get('/articles', (_req: Request, res: Response) => {
  const arts = filterByHours(loadArticles(), 48);
  res.json(arts);
});

// GET /rank/authors
app.get('/rank/authors', (_req: Request, res: Response) => {
  const arts = filterByHours(loadArticles(), 48);
  res.json(rankAuthors(arts));
});

// GET /rank/topics
app.get('/rank/topics', (_req: Request, res: Response) => {
  const arts = filterByHours(loadArticles(), 48);
  res.json(rankTopics(arts));
});

// Post airdrop endpoint - mint NFT to given address
app.post('/airdrop', async (req: Request, res: Response) => {
  try {
    // Handle both old format {type, name} and new format {name, category, recipient}
    const { name, category, type, recipient } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Missing required field: name' });
    }
    
    // Use category if provided, otherwise use type (for backward compatibility)
    const actualCategory = category || type;
    
    if (!process.env.PRIVATE_KEY || !process.env.SEPOLIA_RPC_URL || !process.env.CONTRACT_ADDRESS) {
      return res.status(500).json({ error: 'Missing environment variables' });
    }

    // Use provided recipient or default to contract owner
    // Default to provided recipient, then ENV wallet address, then contract owner
    const targetRecipient = recipient || process.env.WALLET_ADDRESS || contractOwnerAddress;
    if (!targetRecipient) {
      return res.status(400).json({ error: 'No recipient provided and no default wallet address' });
    }

    const txId = crypto.randomUUID();
    
    try {
      console.log(`🚀 Starting on-chain NFT mint for ${name} (${actualCategory}) to ${targetRecipient}`);
      
      // Setup provider and contract
      const provider = new JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
      const wallet = new Wallet(process.env.PRIVATE_KEY, provider);
      
      const contractABI = [
        "function mintReward(address to, string calldata winnerType, string calldata winnerValue, string calldata tokenURI_, bytes32 batchHash, string calldata batchUri) external returns (uint256)",
        "event RewardMinted(address indexed to, uint256 indexed tokenId, string winnerType, string winnerValue, bytes32 batchHash, string batchUri)"
      ];
      
      const contract = new Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
      
      // Mint the NFT on-chain with updated parameters
      const winnerType = actualCategory || 'author';
      const winnerValue = name;
      const tokenURI_ = `ipfs://placeholder-${txId}`; // You can implement proper IPFS later
      const batchHash = '0x' + crypto.createHash('sha256').update(JSON.stringify({name, category: actualCategory, timestamp: new Date()})).digest('hex');
      const batchUri = `http://localhost:4000/api/metadata/${txId}`;
      
      const tx = await contract.mintReward(targetRecipient, winnerType, winnerValue, tokenURI_, batchHash, batchUri);
      console.log(`📝 Transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
      
      // Parse logs to get tokenId
      let tokenId = null;
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          if (parsedLog?.name === 'RewardMinted') {
            tokenId = parsedLog.args.tokenId.toString();
            console.log(`🎁 NFT minted with tokenId: ${tokenId}`);
            break;
          }
        } catch (e) {
          // Skip logs that aren't from our contract
        }
      }
      
      // Log successful on-chain transaction
      const onChainLog = {
        id: txId,
        type: 'airdrop',
        name,
        category: actualCategory,
        timestamp: new Date().toISOString(),
        isOnChain: true,
        txHash: tx.hash,
        tokenId: tokenId,
        recipient: targetRecipient,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        contractAddress: process.env.CONTRACT_ADDRESS
      };
      
      // Save to txlog
      const txLogPath = path.join(__dirname, '../data/txlog.json');
      let txLog = [];
      if (fs.existsSync(txLogPath)) {
        txLog = JSON.parse(fs.readFileSync(txLogPath, 'utf8'));
      }
      txLog.push(onChainLog);
      fs.writeFileSync(txLogPath, JSON.stringify(txLog, null, 2));
      
      console.log(`💾 On-chain transaction logged: ${JSON.stringify(onChainLog, null, 2)}`);
      
      // Return flat AirdropResponse for frontend compatibility
      const responsePayload = {
        id: onChainLog.id,
        type: onChainLog.category as 'author' | 'topic',
        name: onChainLog.name,
        timestamp: new Date(onChainLog.timestamp).valueOf(),
        onChainTx: onChainLog.txHash,
        tokenId: Number(onChainLog.tokenId)
      };
      return res.json(responsePayload);
    } catch (mintError) {
      console.error('❌ On-chain mint failed:', mintError);
      
      const errorMessage = mintError instanceof Error ? mintError.message : String(mintError);
      
      // Log failed attempt
      const failedLog = {
        id: txId,
        type: 'airdrop',
        name,
        category: actualCategory,
        timestamp: new Date().toISOString(),
        isOnChain: false,
        error: errorMessage,
        recipient: targetRecipient
      };
      
      const txLogPath = path.join(__dirname, '../data/txlog.json');
      let txLog = [];
      if (fs.existsSync(txLogPath)) {
        txLog = JSON.parse(fs.readFileSync(txLogPath, 'utf8'));
      }
      txLog.push(failedLog);
      fs.writeFileSync(txLogPath, JSON.stringify(txLog, null, 2));
      
      res.status(500).json({ 
        error: 'On-chain mint failed', 
        details: errorMessage 
      });
    }
    
  } catch (error) {
    console.error('❌ Airdrop endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /txlog
app.get('/txlog', (_req: Request, res: Response) => {
  res.json(getTxLog());
});

// GET /health - Check contract connection
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    contractConfigured: !!(nftContract && contractOwnerAddress),
    contractAddress: CONTRACT_ADDRESS || null,
    ownerAddress: contractOwnerAddress
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));
