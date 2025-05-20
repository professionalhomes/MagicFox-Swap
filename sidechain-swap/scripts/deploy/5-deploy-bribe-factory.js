const hre = require("hardhat");

async function main() {
    [deployer] = await hre.ethers.getSigners();
    const BRIBEContract = await hre.ethers.getContractFactory("BribeFactoryV2");
    const BRIBE_F = await upgrades.deployProxy(BRIBEContract, [deployer.address]);
    await BRIBE_F.deployed();

    console.log("BribeFactoryV2 deployed to: %saddress/%s", hre.network.config.explorer, BRIBE_F.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
