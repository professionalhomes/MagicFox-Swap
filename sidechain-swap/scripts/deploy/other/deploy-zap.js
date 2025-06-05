const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const ContractF = await hre.ethers.getContractFactory("MagicZap");
    const contr = await ContractF.deploy(
        addresses.swapRouter,
        hre.ethers.constants.AddressZero,
        hre.ethers.constants.AddressZero
    );

    await contr.deployed();

    console.log("MagicZap deployed to: %saddress/%s", hre.network.config.explorer, contr.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
