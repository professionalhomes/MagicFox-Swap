const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const RDContract = await ethers.getContractFactory("RewardsDistributor");
    const REWARD_DIST = await RDContract.deploy(addresses.veToken, addresses.usdc);
    await REWARD_DIST.deployed();

    console.log("RewardsDistributor deployed to: %saddress/%s", hre.network.config.explorer, REWARD_DIST.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
