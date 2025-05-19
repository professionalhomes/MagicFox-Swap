const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const contract = await ethers.getContractFactory("BluechipVoter");
    const BLUE_CHIP_VOTER = await upgrades.deployProxy(contract, [
        addresses.veToken, 
        addresses.pairFactory, 
        addresses.gaugeFactory, 
        addresses.proxyOFT,
        addresses.bluechipFeeCollector
    ]);
    await BLUE_CHIP_VOTER.deployed();

    console.log("BluechipVoter deployed to: %saddress/%s", hre.network.config.explorer, BLUE_CHIP_VOTER.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
