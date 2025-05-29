const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const ContractF = await hre.ethers.getContractFactory("FairlaunchZap");
    const contr = await ContractF.deploy(
        addresses.wnative,
        addresses.usdc,
    );

    await contr.deployed();

    console.log("FairlaunchZap deployed to: %saddress/%s", hre.network.config.explorer, contr.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
