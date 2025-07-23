// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTReward is ERC721URIStorage, Ownable {
    uint256 private _tokenCounter;

    event RewardMinted(
        address indexed to,
        uint256 indexed tokenId,
        string  winnerType,
        string  winnerValue,
        bytes32 batchHash,
        string  batchUri
    );

    // OZ v5 constructor with initial owner
    constructor() ERC721("NewsReward", "NWR") Ownable(msg.sender) {
        _tokenCounter = 1;
    }

    /**
     * @dev Mint NFT to `to` with metadata. Only owner.
     * @param to          recipient wallet
     * @param winnerType  "author" or "topic"
     * @param winnerValue e.g. "Cointelegraph by Rakesh Upadhyay" or "bitcoin"
     * @param tokenURI_   ipfs://... metadata
     * @param batchHash   keccak256 of scraped JSON
     * @param batchUri    ipfs/http uri of JSON batch file
     */
    function mintReward(
        address to,
        string calldata winnerType,
        string calldata winnerValue,
        string calldata tokenURI_,
        bytes32 batchHash,
        string calldata batchUri
    ) external onlyOwner returns (uint256 tokenId) {
        tokenId = _tokenCounter++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        emit RewardMinted(to, tokenId, winnerType, winnerValue, batchHash, batchUri);
    }
}
