const hre = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const deployer = (await hre.ethers.getSigners())[0];

    const VE = await hre.ethers.getContractFactory("VotingEscrowMirror");
    const upgraded = await upgrades.upgradeProxy(addresses.veToken, VE);
    
    console.log("VE upgraded to: %saddress/%s", hre.network.config.explorer, upgraded.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
