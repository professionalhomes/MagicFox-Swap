const hre = require("hardhat");

async function main() {
    const ContractF = await hre.ethers.getContractFactory("PairFactory");
    const contr = await ContractF.deploy();

    await contr.deployed();

    console.log("PairFactory deployed to: %saddress/%s", hre.network.config.explorer, contr.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
