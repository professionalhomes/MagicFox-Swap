const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const investor = (await hre.ethers.getSigners())[1];

    let adapterParams = ethers.utils.solidityPack(
        ["uint16", "uint", "uint", "address"],
        [2, 200000, ethers.utils.parseUnits('0.001', 18), "0x16a22488426742CDe589BC1D299D55BfaF28093d"]
    );

    console.log(adapterParams);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
