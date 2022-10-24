import { ethers, network } from 'hardhat'
import { BasicNFT, NFTMarketplace } from '../typechain-types'
import moveBlocks from '../utils/moveBlocks'

const TOKEN_ID = 4

async function buy() {
    const nftMarket: NFTMarketplace = await ethers.getContract('NFTMarketplace')
    const basicNFT: BasicNFT = await ethers.getContract('BasicNFT')
    const tx = await nftMarket.buyItem(basicNFT.address, TOKEN_ID, {
        value: ethers.utils.parseEther('0.02'),
    })
    await tx.wait(1)

    console.log('NFT bought')

    if (network.config.chainId === 31337) {
        await moveBlocks(2, 1000)
    }
}

buy()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
