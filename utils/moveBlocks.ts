import { network } from 'hardhat'

export default async function (amount: number, sleepAmount = 0) {
    console.log('moving blocks....')

    for (let i = 0; i < amount; i++) {
        await network.provider.request({
            method: 'evm_mine',
        })

        if (sleepAmount) {
            console.log(`sleeping for ${sleepAmount}ms`)
            await sleep(sleepAmount)
        }
    }
}

function sleep(time: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, time))
}
