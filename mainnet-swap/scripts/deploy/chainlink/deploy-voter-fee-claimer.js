const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const contractF = await hre.ethers.getContractFactory("VoterFeeClaimer");
    const FEE_CLAIMER = await upgrades.deployProxy(contractF, [
        [addresses.voter, addresses.bluechipVoter]
    ]);
    await FEE_CLAIMER.deployed();

    console.log("VoterFeeClaimer deployed to: %saddress/%s", hre.network.config.explorer, FEE_CLAIMER.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
