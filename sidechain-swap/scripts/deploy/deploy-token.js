const hre = require("hardhat");

async function main() {
    [deployer] = await hre.ethers.getSigners()
    const ContractF = await hre.ethers.getContractFactory("DummyToken");
    const contr = await ContractF.deploy(deployer.address);

    await contr.deployed();

    console.log("DummyToken deployed to: %saddress/%s", hre.network.config.explorer, contr.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
