const hre = require("hardhat");

async function main() {
    [deployer] = await hre.ethers.getSigners()
    const ContractF = await hre.ethers.getContractFactory("MagicFoxTimelock");
    const contr = await ContractF.deploy(
        30, // minDelay 30sec
        [deployer.address], // proposers
        [deployer.address], // executors
        deployer.address, // admin
    );

    await contr.deployed();

    console.log("MagicFoxTimelock deployed to: %saddress/%s", hre.network.config.explorer, contr.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
