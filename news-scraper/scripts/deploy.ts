import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying NFTReward contract...');
  const NFTReward = await ethers.getContractFactory('NFTReward');
  const nftReward = await NFTReward.deploy();
  await nftReward.waitForDeployment();
  console.log('NFTReward deployed to:', nftReward.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
