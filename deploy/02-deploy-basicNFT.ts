import { DeployFunction } from 'hardhat-deploy/dist/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { developmetChains } from '../helper-hardhat-config'
import { verify } from '../utils/verify'
import 'dotenv/config'

const func: DeployFunction = async ({
    network,
    getNamedAccounts,
    deployments,
}: HardhatRuntimeEnvironment) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log('--------------------------------------------')

    const basicNFT = await deploy('BasicNFT', {
        from: deployer,
        log: true,
        waitConfirmations: network.config.chainId === 31337 ? 1 : 6,
    })

    if (!developmetChains.includes(network.name) && process.env.API_KEY) {
        log('verifying....')
        await verify(basicNFT.address, [])
    }

    log('--------------------------------------------')
}

export default func
func.tags = ['all', 'basic']
