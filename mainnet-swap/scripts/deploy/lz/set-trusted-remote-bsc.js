const hre = require("hardhat");
const constants = require("../../../../constants.js");

async function main() {
    const deployer = (await hre.ethers.getSigners())[0];

    const TOKEN = await hre.ethers.getContractAt('ProxyOFT', constants.BSC.proxyOFT, deployer);
    
    let tx;
    tx = await TOKEN.setTrustedRemoteAddress(constants.ARBITRUM.lzChainId, constants.ARBITRUM.token);
    await tx.wait();
    console.log("setTrustedRemoteAddress ARBITRUM");

    tx = await TOKEN.setTrustedRemoteAddress(constants.POLYGON.lzChainId, constants.POLYGON.token);
    await tx.wait();
    console.log("setTrustedRemoteAddress POLYGON");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
