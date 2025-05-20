const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const MINTERContract = await ethers.getContractFactory("Minter");
    const MINTER = await upgrades.deployProxy(MINTERContract, [
        addresses.voter, 
        addresses.bluechipVoter, 
        addresses.veToken, 
        addresses.rewardDistributorToken
    ]);
    await MINTER.deployed();

    console.log("Minter deployed to: %saddress/%s", hre.network.config.explorer, MINTER.address);

    const tx = await MINTER._initialize([], [], 0);
    await tx.wait();
    console.log("Minter initialized");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
