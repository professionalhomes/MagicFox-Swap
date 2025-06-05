const hre = require("hardhat");
const constants = require("../../../../constants.js");

async function main() {
    const deployer = (await hre.ethers.getSigners())[0];

    const TOKEN = await hre.ethers.getContractAt('OFT', constants.ARBITRUM.token, deployer);
    
    let tx;
    tx = await TOKEN.setMinDstGas(constants.BSC.lzChainId, 0, 200000);
    await tx.wait();
    console.log("setMinDstGas BSC");

    tx = await TOKEN.setMinDstGas(constants.POLYGON.lzChainId, 0, 200000);
    await tx.wait();
    console.log("setMinDstGas POLYGON");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
