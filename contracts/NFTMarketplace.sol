//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error NFTMarketplace__PriceMustNotBeZero();
error NFTMarketplace__NotApprovedForMarketPlace();
error NFTMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NFTMarketplace__NotOwnerOfNFT();
error NFTMarketplace__NotListed(address nftAddress, uint256 tokenId);
error NFTMarketplace__PriceNotMet(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);
error NFTMarketplace__NoProceeds();
error NFTMarketplace__WithdrawFailed();

contract NFTMarketplace is ReentrancyGuard {
    /**Data structers */
    struct Listing {
        uint256 price;
        address seller;
    }

    /**Events */
    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCancelled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    /**Variables */
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    //seller -> earnings
    mapping(address => uint256) private s_proceeds;

    /**modifiers */
    modifier notListed(
        address _nftAddress,
        uint256 _tokenId,
        address _owner
    ) {
        Listing memory listing = s_listings[_nftAddress][_tokenId];

        if (listing.price > 0 && listing.seller == _owner) {
            revert NFTMarketplace__AlreadyListed(_nftAddress, _tokenId);
        }
        _;
    }

    modifier isOwner(
        address _nftAddress,
        uint256 _tokenId,
        address _seller
    ) {
        IERC721 nft = IERC721(_nftAddress);
        address owner = nft.ownerOf(_tokenId);

        if (_seller != owner) {
            revert NFTMarketplace__NotOwnerOfNFT();
        }
        _;
    }

    modifier isListed(address _nftAddress, uint256 _tokenId) {
        Listing memory listing = s_listings[_nftAddress][_tokenId];

        if (listing.price <= 0) {
            revert NFTMarketplace__NotListed(_nftAddress, _tokenId);
        }

        _;
    }

    /**Main functions */

    function listItem(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _price
    )
        external
        isOwner(_nftAddress, _tokenId, msg.sender)
        notListed(_nftAddress, _tokenId, msg.sender)
    {
        if (_price <= 0) {
            revert NFTMarketplace__PriceMustNotBeZero();
        }

        IERC721 nft = IERC721(_nftAddress);

        if (nft.getApproved(_tokenId) != address(this)) {
            revert NFTMarketplace__NotApprovedForMarketPlace();
        }

        s_listings[_nftAddress][_tokenId] = Listing(_price, msg.sender);
        emit ItemListed(msg.sender, _nftAddress, _tokenId, _price);
    }

    function buyItem(address _nftAddress, uint256 _tokenId)
        external
        payable
        nonReentrant
        isListed(_nftAddress, _tokenId)
    {
        Listing memory listedItem = s_listings[_nftAddress][_tokenId];

        if (msg.value < listedItem.price) {
            revert NFTMarketplace__PriceNotMet(
                _nftAddress,
                _tokenId,
                listedItem.price
            );
        }

        s_proceeds[listedItem.seller] += msg.value;
        delete (s_listings[_nftAddress][_tokenId]);

        IERC721(_nftAddress).safeTransferFrom(
            listedItem.seller,
            msg.sender,
            _tokenId
        );

        emit ItemBought(msg.sender, _nftAddress, _tokenId, listedItem.price);
    }

    function cancelListing(address _nftAddress, uint256 _tokenId)
        external
        isOwner(_nftAddress, _tokenId, msg.sender)
        isListed(_nftAddress, _tokenId)
    {
        delete (s_listings[_nftAddress][_tokenId]);
        emit ItemCancelled(msg.sender, _nftAddress, _tokenId);
    }

    function updateListing(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _newPrice
    )
        external
        isOwner(_nftAddress, _tokenId, msg.sender)
        isListed(_nftAddress, _tokenId)
    {
        s_listings[_nftAddress][_tokenId].price = _newPrice;
        emit ItemListed(msg.sender, _nftAddress, _tokenId, _newPrice);
    }

    function withdrawProceeds() external nonReentrant {
        uint256 proceeds = s_proceeds[msg.sender];

        if (proceeds <= 0) {
            revert NFTMarketplace__NoProceeds();
        }

        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");

        if (!success) {
            revert NFTMarketplace__WithdrawFailed();
        }
    }

    /**Getter functions */

    function getListing(address _nftAddress, uint256 _tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[_nftAddress][_tokenId];
    }

    function getProceeds(address _seller) external view returns (uint256) {
        return s_proceeds[_seller];
    }
}
