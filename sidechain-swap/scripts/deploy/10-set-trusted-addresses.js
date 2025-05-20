const hre = require("hardhat");
const constants = require("../../../constants.js");

async function main() {
    const addresses = hre.network.config.constants;
    const deployer = (await hre.ethers.getSigners())[0];
    
    const TOKEN = await hre.ethers.getContractAt('OFT', addresses.token, deployer);
    
    let tx;

    tx = await TOKEN.whitelistVoter(addresses.voter, true);
    await tx.wait();
    console.log("TOKEN.whitelistVoter VOTER");

    tx = await TOKEN.whitelistVoter(addresses.bluechipVoter, true);
    await tx.wait();
    console.log("TOKEN.whitelistVoter BLUECHIP_VOTER");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
