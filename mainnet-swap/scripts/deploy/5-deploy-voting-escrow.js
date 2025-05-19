const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const ContractF = await hre.ethers.getContractFactory("VotingEscrow");
    const contr = await ContractF.deploy(
        addresses.token, // address FOX
        addresses.veArt, // address ART
    );

    await contr.deployed();

    console.log("VotingEscrow deployed to: %saddress/%s", hre.network.config.explorer, contr.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
