import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert, expect } from 'chai'
import { getNamedAccounts, ethers, network, deployments } from 'hardhat'
import { developmetChains } from '../../helper-hardhat-config'
import { BasicNFT, NFTMarketplace } from '../../typechain-types'

!developmetChains.includes(network.name)
    ? describe.skip
    : describe('NFTMarketplace', () => {
          const PRICE = ethers.utils.parseEther('0.01')
          const TOKEN_ID = 0

          let deployer: string
          let player: SignerWithAddress
          let NFTMarket: NFTMarketplace
          let basicNFT: BasicNFT

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              player = (await ethers.getSigners())[0]

              await deployments.fixture(['all'])

              NFTMarket = await ethers.getContract('NFTMarketplace', deployer)
              basicNFT = await ethers.getContract('BasicNFT', deployer)
              await basicNFT.mintNFT()
              await basicNFT.approve(NFTMarket.address, TOKEN_ID)
          })

          describe('buy and sell NFT from marketplace', () => {
              it('lists and can be bought', async () => {
                  await NFTMarket.listItem(basicNFT.address, TOKEN_ID, PRICE)

                  const playerConnected = NFTMarket.connect(player)
                  await playerConnected.buyItem(basicNFT.address, TOKEN_ID, {
                      value: PRICE,
                  })

                  const ownerOf = await basicNFT.ownerOf(TOKEN_ID)
                  const deployerProceeds = await NFTMarket.getProceeds(deployer)

                  assert.equal(ownerOf, player.address)
                  assert.equal(deployerProceeds.toString(), PRICE.toString())
              })
          })
      })
