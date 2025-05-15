const hre = require("hardhat");

async function main() {
    const ContractF = await hre.ethers.getContractFactory("ProxyOFT");
    const contr = await ContractF.deploy(
        '0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7', // address _lzEndpoint -- FTM, 
        '0xcBE52059f5E4660c13a318B5c96426f8ae719922', // address _token
    );

    await contr.deployed();

    console.log("ProxyOFT deployed to: %saddress/%s", hre.network.config.explorer, contr.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
