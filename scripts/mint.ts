import { ethers, network } from 'hardhat'
import { BasicNFT } from '../typechain-types'
import moveBlocks from '../utils/moveBlocks'

export const PRICE = ethers.utils.parseEther('0.01')

async function mintAndList() {
    const basicNFT: BasicNFT = await ethers.getContract('BasicNFT')

    console.log('minting...', basicNFT.address)
    const mintTx = await basicNFT.mintNFT()
    const events = (await mintTx.wait(1)).events!
    const tokenId = events[0].args?.tokenId

    console.log('minted....', tokenId)

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
