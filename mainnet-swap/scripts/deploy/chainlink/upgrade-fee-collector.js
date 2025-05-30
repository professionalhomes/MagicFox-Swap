const hre = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;

    const FEE_COLLECTOR = await hre.ethers.getContractFactory("FeeCollector");
    const upgraded = await upgrades.upgradeProxy(addresses.bluechipFeeCollector, FEE_COLLECTOR);
    
    console.log("FeeCollector upgraded to: %saddress/%s", hre.network.config.explorer, upgraded.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
