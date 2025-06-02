const hre = require("hardhat");
const constants = require("../../../../constants.js");

async function main() {
  const addresses = hre.network.config.constants;
  const deployer = (await hre.ethers.getSigners())[0];
  
  const VOTER = await hre.ethers.getContractAt('VoterV2_1', addresses.voter, deployer);
  const BLUECHIP_VOTER = await hre.ethers.getContractAt('BluechipVoter', addresses.bluechipVoter, deployer);
    
    let tx;
    tx = await VOTER.setSidechainManager(constants.POLYGON.lzChainId, constants.POLYGON.lzReceiver);
    await tx.wait();
    console.log("VOTER.setSidechainManager");

    tx = await BLUECHIP_VOTER.setSidechainManager(constants.POLYGON.lzChainId, constants.POLYGON.lzReceiverBluechip);
    await tx.wait();
    console.log("BLUECHIP_VOTER.setSidechainManager");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
