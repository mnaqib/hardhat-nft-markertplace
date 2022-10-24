import moveBlocks from '../utils/moveBlocks'

async function main() {
    await moveBlocks(4, 1000)
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err)
        process.exit(1)
    })
