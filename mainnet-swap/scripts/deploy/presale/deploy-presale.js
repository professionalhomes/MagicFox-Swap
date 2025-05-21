const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const ContractF = await hre.ethers.getContractFactory("Presale");
    const contr = await ContractF.deploy(
        addresses.token,
        addresses.veToken,
        addresses.shroom,
        addresses.veShroom,
        '0x40E7f9B2f080567c41667E0648BA870a85797694', // Use fake usdc for testing -- addresses.usdc, -- SALE_TOKEN
        1681642800, // Sunday, April 16, 2023 11:00:00 AM -- START_TIME
        1682074800, // Friday, April 21, 2023 11:00:00 AM -- END_TIME
        addresses.treasury // treasury
    );

    await contr.deployed();

    console.log("Presale deployed to: %saddress/%s", hre.network.config.explorer, contr.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
