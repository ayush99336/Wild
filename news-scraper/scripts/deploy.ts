import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying Reward contract...');
  const Reward = await ethers.getContractFactory('Reward');
  const reward = await Reward.deploy();
  await reward.waitForDeployment();
  console.log('Reward deployed to:', reward.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
