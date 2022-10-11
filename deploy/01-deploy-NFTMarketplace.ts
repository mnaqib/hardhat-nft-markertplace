import { DeployFunction } from 'hardhat-deploy/dist/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { developmetChains } from '../helper-hardhat-config'
import 'dotenv/config'
import { verify } from '../utils/verify'

const func: DeployFunction = async ({
    network,
    getNamedAccounts,
    deployments,
}: HardhatRuntimeEnvironment) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log('--------------------------------------------')

    const nftMarketplace = await deploy('NFTMarketplace', {
        from: deployer,
        log: true,
        waitConfirmations: network.config.chainId === 31337 ? 1 : 6,
    })

    if (!developmetChains.includes(network.name) && process.env.API_KEY) {
        log('verifying...')
        await verify(nftMarketplace.address, [])
    }

    log('--------------------------------------------')
}

export default func
func.tags = ['all', 'market']
