const hre = require("hardhat");

async function main() {
    [deployer] = await hre.ethers.getSigners();
    const ContractF = await hre.ethers.getContractFactory("VoterV2_1");
    const contr = await ContractF.deploy();

    await contr.deployed();

    console.log("VoterV2_1 deployed to: %saddress/%s", hre.network.config.explorer, contr.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
