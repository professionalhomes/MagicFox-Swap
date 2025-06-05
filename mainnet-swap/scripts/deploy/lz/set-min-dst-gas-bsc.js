const hre = require("hardhat");
const constants = require("../../../../constants.js");

async function main() {
    const deployer = (await hre.ethers.getSigners())[0];

    const TOKEN = await hre.ethers.getContractAt('ProxyOFT', constants.BSC.proxyOFT, deployer);
    
    let tx;
    tx = await TOKEN.setMinDstGas(constants.ARBITRUM.lzChainId, 0, 200000);
    await tx.wait();
    console.log("setMinDstGas ARBITRUM");

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
