const hre = require("hardhat");
const constants = require("../../../../constants.js");

async function main() {
    const deployer = (await hre.ethers.getSigners())[0];

    const TOKEN = await hre.ethers.getContractAt('OFT', constants.POLYGON.token, deployer);
    
    let tx;
    tx = await TOKEN.setTrustedRemoteAddress(constants.BSC.lzChainId, constants.BSC.proxyOFT);
    await tx.wait();
    console.log("setTrustedRemoteAddress BSC");

    tx = await TOKEN.setTrustedRemoteAddress(constants.ARBITRUM.lzChainId, constants.ARBITRUM.token);
    await tx.wait();
    console.log("setTrustedRemoteAddress ARBITRUM");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
