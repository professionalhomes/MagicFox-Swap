const hre = require("hardhat");

async function main() {
    const ContractF = await hre.ethers.getContractFactory("Router");
    const contr = await ContractF.deploy(
        "0x6CE2738Ce9903111869C1dd23e4286B1d9992344", // factory
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // weth
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
