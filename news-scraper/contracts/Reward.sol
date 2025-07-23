// contracts/Reward.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Reward {
    event Rewarded(string indexed _name, address indexed _receiver);

    function reward(string calldata _name) external {
        // In a real contract, minting logic would go here (e.g., ERC721/ERC20)
        emit Rewarded(_name, msg.sender);
    }
}
