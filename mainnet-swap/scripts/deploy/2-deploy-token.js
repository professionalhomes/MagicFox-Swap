const hre = require("hardhat");

async function main() {
    [deployer] = await hre.ethers.getSigners()
    const ContractF = await hre.ethers.getContractFactory("Token");
    const contr = await ContractF.deploy();

    await contr.deployed();

    console.log("Token deployed to: %saddress/%s", hre.network.config.explorer, contr.address);

    const tx = await contr.initialMint(deployer.address);
    await tx.wait();

    console.log("Initial mint done!");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
