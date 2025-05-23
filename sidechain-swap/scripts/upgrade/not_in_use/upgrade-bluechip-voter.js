const hre = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const deployer = (await hre.ethers.getSigners())[0];

    const VOTER = await hre.ethers.getContractFactory("BluechipVoter");
    const upgraded = await upgrades.upgradeProxy(addresses.bluechipVoter, VOTER);
    
    console.log("BluechipVoter upgraded to: %saddress/%s", hre.network.config.explorer, upgraded.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
