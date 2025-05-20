const hre = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const deployer = (await hre.ethers.getSigners())[0];

    const VOTER = await hre.ethers.getContractFactory("VoterV2_1");
    const upgraded = await upgrades.upgradeProxy(addresses.voter, VOTER);
    
    console.log("VoterV2_1 upgraded to: %saddress/%s", hre.network.config.explorer, upgraded.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
