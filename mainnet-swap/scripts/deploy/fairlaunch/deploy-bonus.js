const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const ContractF = await hre.ethers.getContractFactory("FairlaunchBonus");
    const contr = await ContractF.deploy(
        addresses.token,
        addresses.veToken,
        addresses.shroom,
        addresses.veShroom,
        addresses.fairlaunchBonusTreasury
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
