const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const ContractF = await hre.ethers.getContractFactory("ProxyOFT");
    const contr = await ContractF.deploy(
        addresses.lzEndpoint, // address _lzEndpoint, 
        addresses.token, // address _token
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
