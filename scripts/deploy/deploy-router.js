const hre = require("hardhat");

async function main() {
    const ContractF = await hre.ethers.getContractFactory("Router");
    const contr = await ContractF.deploy(
        "0x3B76A001F1FAd7cfFe01F90Bbab13B775aaD7859", // factory
        "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", // weth
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
