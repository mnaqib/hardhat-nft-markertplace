import { ethers, network } from 'hardhat'
import { BasicNFT, NFTMarketplace } from '../typechain-types'
import moveBlocks from '../utils/moveBlocks'

const TOKEN_ID = 1

async function cancel() {
    const nftMarket: NFTMarketplace = await ethers.getContract('NFTMarketplace')
    const basicNFT: BasicNFT = await ethers.getContract('BasicNFT')
    const tx = await nftMarket.cancelListing(basicNFT.address, TOKEN_ID)
    await tx.wait(1)

    console.log('NFT cancelled')

    if (network.config.chainId === 31337) {
        await moveBlocks(2, 1000)
    }
}

cancel()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
