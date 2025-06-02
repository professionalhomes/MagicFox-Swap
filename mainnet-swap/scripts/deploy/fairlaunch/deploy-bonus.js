const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const ContractF = await hre.ethers.getContractFactory("FairlaunchBonus");
    const contr = await ContractF.deploy(
        addresses.token,
        addresses.veToken,
        addresses.shroom,
        addresses.veShroom,
        '0x028edcd90A788238b17959b8B43e2D157C2fB66a'
    );

    await contr.deployed();

    console.log("FairlaunchBonus deployed to: %saddress/%s", hre.network.config.explorer, contr.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
