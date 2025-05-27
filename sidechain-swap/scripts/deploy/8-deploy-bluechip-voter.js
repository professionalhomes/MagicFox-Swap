const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const VOTERContract = await ethers.getContractFactory("BluechipVoter");
    const VOTER = await upgrades.deployProxy(VOTERContract, [
        addresses.veToken, 
        addresses.pairFactory, 
        addresses.gaugeFactory, 
        addresses.bluechipFeeCollector
    ]);
    await VOTER.deployed();

    console.log("BluechipVoter deployed to: %saddress/%s", hre.network.config.explorer, VOTER.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
