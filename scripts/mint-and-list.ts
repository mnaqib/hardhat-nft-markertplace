import { ethers } from 'hardhat'
import { BasicNFT, NFTMarketplace } from '../typechain-types'

export const PRICE = ethers.utils.parseEther('0.01')

async function mintAndList() {
    const nftMarket: NFTMarketplace = await ethers.getContract('NFTMarketplace')
    const basicNFT: BasicNFT = await ethers.getContract('BasicNFT')

    console.log('minting...')
    const mintTx = await basicNFT.mintNFT()
    const events = (await mintTx.wait(1)).events!
    const tokenId = events[0].args?.tokenId

    console.log('Approving NFT....')
    const approvalTx = await basicNFT.approve(nftMarket.address, tokenId)
    await approvalTx.wait(1)

    console.log('Listing NFT...')
    const tx = await nftMarket.listItem(basicNFT.address, tokenId, PRICE)
    await tx.wait(1)
    console.log('listed....')
}

mintAndList()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
