const hre = require("hardhat");
const constants = require("../../../../constants.js");

async function main() {
    const addresses = hre.network.config.constants;
    const contractF = await hre.ethers.getContractFactory("WeeklyEmissionBridge");
    const WEEKLY_EMISSION_BRIDGE = await upgrades.deployProxy(contractF, [
        addresses.minter,
        addresses.voter,
        addresses.bluechipVoter,
        1000000,
        constants.POLYGON.lzChainId,
        hre.ethers.utils.parseUnits("0.006")
    ]);
    await WEEKLY_EMISSION_BRIDGE.deployed();

    console.log("WeeklyEmissionBridge deployed to: %saddress/%s", hre.network.config.explorer, WEEKLY_EMISSION_BRIDGE.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
