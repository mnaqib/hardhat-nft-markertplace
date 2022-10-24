import 'dotenv/config'
import { ethers, network } from 'hardhat'
import { BasicNFT, NFTMarketplace } from '../typechain-types'
import fs from 'fs'
import { DeployFunction } from 'hardhat-deploy/dist/types'

const frontendContractsFile =
    '../nextjs-nft-moralis/constants/networkMapping.json'

const frontendAbiFile = '../nextjs-nft-moralis/constants'

const func: DeployFunction = async () => {
    const nftMarket: NFTMarketplace = await ethers.getContract('NFTMarketplace')
    const basicNFT: BasicNFT = await ethers.getContract('BasicNFT')

    if (process.env.UPDATE_FRONT_END) {
        console.log('updating frontend.....')

        await updateContractAddresses(nftMarket)
        await updateAbi(nftMarket, basicNFT)
    }
}

async function updateAbi(nftMarket: NFTMarketplace, basicNFT: BasicNFT) {
    fs.writeFileSync(
        `${frontendAbiFile}/NFTMarketplace.json`,
        nftMarket.interface.format(ethers.utils.FormatTypes.json) as any
    )

    fs.writeFileSync(
        `${frontendAbiFile}/basicNFT.json`,
        basicNFT.interface.format(ethers.utils.FormatTypes.json) as any
    )
}

async function updateContractAddresses(nftMarket: NFTMarketplace) {
    const chainId = network.config.chainId!.toString()
    const contractAddresses = JSON.parse(
        fs.readFileSync(frontendContractsFile, 'utf-8')
    )

    if (chainId in contractAddresses) {
        if (
            !contractAddresses[chainId]['nftMarketplace'].includes(
                nftMarket.address
            )
        ) {
            contractAddresses[chainId]['nftMarketplace'].unshift(
                nftMarket.address
            )
        }
    } else {
        contractAddresses[chainId] = { nftMarketplace: [nftMarket.address] }
    }
    console.log(contractAddresses)

    fs.writeFileSync(frontendContractsFile, JSON.stringify(contractAddresses))
}

export default func
func.tags = ['all', 'fe']
