const hre = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const deployer = (await hre.ethers.getSigners())[0];

    const GAUGE_FACTORY = await hre.ethers.getContractFactory("GaugeFactoryV2");
    const upgraded = await upgrades.upgradeProxy(addresses.gaugeFactory, GAUGE_FACTORY);
    
    console.log("GaugeFactoryV2 upgraded to: %saddress/%s", hre.network.config.explorer, upgraded.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
