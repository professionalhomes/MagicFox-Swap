const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const ContractF = await hre.ethers.getContractFactory("Router");
    const contr = await ContractF.deploy(
        addresses.pairFactory, // factory
        addresses.wnative, // wnative
    );

    await contr.deployed();

    console.log("Router deployed to: %saddress/%s", hre.network.config.explorer, contr.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
