const hre = require("hardhat");

async function main() {
    // console.log("BEFORE DEPLOYING TOKEN, MAKE SURE ARBITRUM FEE IN FIXED ON FACTORY !!!");

    const addresses = hre.network.config.constants;
    const ContractF = await hre.ethers.getContractFactory("OFT");
    const contr = await ContractF.deploy(
        'Magic Fox', // string memory _name
        'FOX', // string memory _symbol
        addresses.lzEndpoint, // address _lzEndpoint
    );

    await contr.deployed();

    console.log("OFT deployed to: %saddress/%s", hre.network.config.explorer, contr.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
