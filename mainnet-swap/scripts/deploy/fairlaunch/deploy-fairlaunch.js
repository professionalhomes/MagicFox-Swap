const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const ContractF = await hre.ethers.getContractFactory("Fairlaunch");
    const contr = await ContractF.deploy(
        addresses.token,
        addresses.veToken,
        addresses.shroom,
        addresses.veShroom,
        addresses.usdc, // '0x40E7f9B2f080567c41667E0648BA870a85797694', // Use fake usdc for testing -- addresses.usdc, -- SALE_TOKEN
        1683554400, // START_TIME
        1684764000, // END_TIME
        addresses.treasury, // treasury
        addresses.fairlaunchZap, // treasury
    );

    await contr.deployed();

    console.log("Presale deployed to: %saddress/%s", hre.network.config.explorer, contr.address);

    // npx hardhat verify --network bsc 0xa589e8874fF691bd6B9D19b545722791CE532fFD 0xB48837F0C05c0931c7B3DcFDceA0365396c39F3A 0xb241D311f1114ECb6E210c40b0F2040AC8cD485e 0xB48837F0C05c0931c7B3DcFDceA0365396c39F3A 0xb241D311f1114ECb6E210c40b0F2040AC8cD485e 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d 1682598000 1682898000 0x16a22488426742CDe589BC1D299D55BfaF28093d 0x8B0D70d8C3ef0B91F6f33d1715a3790cC1b6E3B1
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
