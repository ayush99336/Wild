import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { JsonRpcProvider, Wallet, Contract } from 'ethers';

const { SEPOLIA_RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS } = process.env;
let nftContract: Contract | null = null;
let contractOwnerAddress: string | null = null;

if (CONTRACT_ADDRESS && SEPOLIA_RPC_URL && PRIVATE_KEY) {
  const provider = new JsonRpcProvider(SEPOLIA_RPC_URL);
  const wallet = new Wallet(PRIVATE_KEY, provider);
  contractOwnerAddress = wallet.address;
  const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'NFTReward.sol', 'NFTReward.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  nftContract = new Contract(CONTRACT_ADDRESS, artifact.abi, wallet);
}

/**
 * Wraps on-chain minting of NFT reward.
 * @param winnerType  "author" or "topic"
 * @param winnerValue the name of author or topic
 * @returns on-chain transaction hash and tokenId, or nulls
 */
export async function mintOnChain(winnerType: string, winnerValue: string): Promise<{ onChainHash: string | null; tokenId: number | null; }> {
  let onChainHash: string | null = null;
  let tokenId: number | null = null;
  if (nftContract && contractOwnerAddress) {
    try {
      const txResponse = await nftContract.mintReward(contractOwnerAddress, winnerType, winnerValue, '', '0x00', '');
      const receipt = await txResponse.wait();
      onChainHash = receipt.transactionHash;
      // find RewardMinted event
      const ev = receipt.events?.find((e: any) => e.event === 'RewardMinted');
      if (ev && ev.args) {
        tokenId = Number(ev.args.tokenId);
      }
    } catch (err: any) {
      console.error('On-chain mint failed', err);
    }
  }
  return { onChainHash, tokenId };
}
