import { ethers, network } from 'hardhat'
import { BasicNFT, NFTMarketplace } from '../typechain-types'
import moveBlocks from '../utils/moveBlocks'

export const PRICE = ethers.utils.parseEther('0.01')

async function mintAndList() {
    const nftMarket: NFTMarketplace = await ethers.getContract('NFTMarketplace')
    const basicNFT: BasicNFT = await ethers.getContract('BasicNFT')

    console.log('minting...', basicNFT.address)
    const mintTx = await basicNFT.mintNFT()
    const events = (await mintTx.wait(1)).events!
    const tokenId = events[0].args?.tokenId

    console.log('Approving NFT....', tokenId)
    const approvalTx = await basicNFT.approve(nftMarket.address, tokenId)
    await approvalTx.wait(1)

    console.log('Listing NFT...', nftMarket.address)
    const tx = await nftMarket.listItem(basicNFT.address, tokenId, PRICE)
    const listEvents = (await tx.wait(1)).events!
    console.log('listed....', listEvents[0].args)

    if (network.config.chainId === 31337) {
        await moveBlocks(2, 1000)
    }
}

mintAndList()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
