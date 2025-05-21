const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const contractF = await hre.ethers.getContractFactory("EpochController");
    const EPOCH_CONTROLLER = await upgrades.deployProxy(contractF, [
        addresses.minter,
        addresses.voter,
        addresses.bluechipVoter
    ]);
    await EPOCH_CONTROLLER.deployed();

    console.log("EpochController deployed to: %saddress/%s", hre.network.config.explorer, EPOCH_CONTROLLER.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
