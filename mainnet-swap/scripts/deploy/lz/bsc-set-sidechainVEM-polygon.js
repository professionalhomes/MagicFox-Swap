const hre = require("hardhat");
const constants = require("../../../../constants.js");

async function main() {
    const deployer = (await hre.ethers.getSigners())[0];

    const VE = await hre.ethers.getContractAt('VotingEscrow', constants.BSC.veToken, deployer);
    
    let tx = await VE.setSidechainVEM(constants.POLYGON.lzChainId, constants.POLYGON.veToken);
    await tx.wait();
    console.log("VE.setSidechainVEM");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
