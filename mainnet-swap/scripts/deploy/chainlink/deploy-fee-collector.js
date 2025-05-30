const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const FeeContract = await ethers.getContractFactory("FeeCollector");
    const FEE_COLLECTOR = await upgrades.deployProxy(FeeContract, [
        addresses.swapRouter, 
        hre.ethers.constants.AddressZero
    ]);
    await FEE_COLLECTOR.deployed();

    console.log("FeeCollector deployed to: %saddress/%s", hre.network.config.explorer, FEE_COLLECTOR.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
