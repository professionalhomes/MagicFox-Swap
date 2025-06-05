const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const ContractF = await hre.ethers.getContractFactory("Presale");

    /* 
    token address: 0x094A5976E0696D27fe25DF02bFEEEcDEEDC3299e
    softcap: 4 BNB
    hardcap: 10 BNB
    price per token: 0.000001
    Start time: Friday, June 16, 2023 10:00:00 AM
    End time: Friday, June 23, 2023 10:00:00 AM
    Treasury: 0xfbc387F3EAF7d5AB0BF7b1DA2f04715d60721c0f
    */

    const contr = await ContractF.deploy(
        '0x094A5976E0696D27fe25DF02bFEEEcDEEDC3299e', // address _token, 
        addresses.wbnb, // address _saleToken, 
        hre.ethers.utils.parseUnits("4000000"), // uint256 _softCap, soft cap: 4.000.000
        hre.ethers.utils.parseUnits("10000000"), // uint256 _hardCap, hard cap: 10.000.000
        hre.ethers.utils.parseUnits("0.000001"), // uint256 _pricePerToken, 
        '1686909600', // uint256 _startTime, 
        '1687514400', // uint256 _endTime,
        '0xfbc387F3EAF7d5AB0BF7b1DA2f04715d60721c0f', // address _treasury
        '0x1bd99249fB4dd646b0a9a7e8d77fAeC4124f75eA', // ZAP
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
