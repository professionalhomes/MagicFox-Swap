const hre = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;

    const WEEKLY_EMISSION_BRIDGE = await hre.ethers.getContractFactory("WeeklyEmissionBridge");
    const upgraded = await upgrades.upgradeProxy(addresses.chainlinkWeeklyEmissionBridge, WEEKLY_EMISSION_BRIDGE);
    
    console.log("WeeklyEmissionBridge upgraded to: %saddress/%s", hre.network.config.explorer, upgraded.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
