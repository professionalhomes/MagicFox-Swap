const hre = require("hardhat");

async function main() {
    console.log(ethers.utils.solidityPack(["uint16", "uint256"], [43114, '50000000000000000000']));

    // const ContractF = await hre.ethers.getContractFactory("OFT");
    // const contr = await ContractF.deploy(
    //     'DummyToken', // string memory _name
    //     'DMY', // string memory _symbol
    //     '0x3c2269811836af69497E5F486A85D7316753cf62', // address _lzEndpoint -- AVAX
    // );

    // await contr.deployed();

    // console.log("OFT deployed to: %saddress/%s", hre.network.config.explorer, contr.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
