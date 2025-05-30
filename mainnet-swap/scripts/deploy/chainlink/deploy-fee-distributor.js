const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const contractF = await hre.ethers.getContractFactory("FeeDistributor");
    const FEE_DISTRIBUTOR = await upgrades.deployProxy(contractF, [
        [addresses.voter, addresses.bluechipVoter]
    ]);
    await FEE_DISTRIBUTOR.deployed();

    console.log("FeeDistributor deployed to: %saddress/%s", hre.network.config.explorer, FEE_DISTRIBUTOR.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
