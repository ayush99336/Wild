import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { ethers } from "ethers";
import NFTRewardAbi from "@/../../artifacts/contracts/NFTReward.sol/NFTReward.json";

const CONTRACT_ADDRESS = "0x47C614427e88CDCd9DA463C7d6BE7a645E0E2328";
const SEPOLIA_RPC = "https://ethereum-sepolia-rpc.publicnode.com"; // or your Infura/Alchemy endpoint

export function OnChainTxView() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, NFTRewardAbi.abi, provider);

        // Fetch RewardMinted events (last 50000 blocks for demo)
        const currentBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(currentBlock - 50000, 0);
        const logs = await contract.queryFilter("RewardMinted", fromBlock, currentBlock);

        setEvents(
          logs
            .map((log: any) => ({
              txHash: log.transactionHash,
              blockNumber: log.blockNumber,
              to: log.args.to,
              tokenId: log.args.tokenId.toString(),
              winnerType: log.args.winnerType,
              winnerValue: log.args.winnerValue,
              batchHash: log.args.batchHash,
              batchUri: log.args.batchUri,
            }))
            .reverse()
        );
      } catch (e) {
        setEvents([]);
      }
      setLoading(false);
    }
    fetchEvents();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>On-Chain NFT Mints</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin" /> Loading on-chain events...
          </div>
        ) : events.length === 0 ? (
          <div className="text-muted-foreground">No on-chain NFT mints found.</div>
        ) : (
          <div className="space-y-4">
            {events.map((ev, i) => (
              <Card key={ev.txHash + i} className="border shadow-sm">
                <CardContent className="py-4 space-y-2">
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="secondary">{ev.winnerType}</Badge>
                    <span className="font-semibold">{ev.winnerValue}</span>
                    <Badge variant="outline">Token #{ev.tokenId}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span>To: {ev.to}</span>
                    <br />
                    <span>
                      Tx:{" "}
                      <a
                        href={`https://sepolia.etherscan.io/tx/${ev.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {ev.txHash.slice(0, 10)}...
                      </a>
                    </span>
                    <br />
                    <span>Block: {ev.blockNumber}</span>
                  </div>
                  {ev.batchUri && (
                    <div className="text-xs">
                      <span>Batch URI: {ev.batchUri}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}