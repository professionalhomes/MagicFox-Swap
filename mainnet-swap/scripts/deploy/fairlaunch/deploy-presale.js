const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const ContractF = await hre.ethers.getContractFactory("Presale");

    /* 
    start: 24.06.2023 14:00 UTC,
    end: 02.07.2023 14:00 UTC,
    tokenSaleSupply: 2000000000,
    softCap: 1 bnb,
    hardCap: 1600 bnb,
    tokenPriceInBnB: 0.0000008,
    */

    const contr = await ContractF.deploy(
        '0xa2A823b91d0C93Cb40BAEd6f963FcF072c768b0d', // address _token, 
        addresses.wbnb, // address _saleToken, 
        hre.ethers.utils.parseUnits("1250000"), // uint256 _softCap, soft cap: 1.250.000
        hre.ethers.utils.parseUnits("2000000000"), // uint256 _hardCap, hard cap: 2.000.000.000
        hre.ethers.utils.parseUnits("0.0000008"), // uint256 _pricePerToken, 
        '1687615200', // uint256 _startTime, 
        '1688306400', // uint256 _endTime,
        '0x0C406C16f4B2FEFe6374Fc06530C28908955F5F8', // address _treasury
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
