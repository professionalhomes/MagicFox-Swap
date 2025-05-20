const hre = require("hardhat");

async function main() {

    // data = ethers.utils.defaultAbiCoder.encode(
    //     [ "uint256", "uint256[]" ], [ 1, [333,555]] 
    // );
    // console.log(data);
    // console.log('0x0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000014d00000000000000000000000000000000000000000000000000000000000015b3')

    // console.log(
    //     ethers.utils.defaultAbiCoder.decode(
    //         [ "uint256", "uint256[]" ], 
    //         //data
    //         '0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000014D00000000000000000000000000000000000000000000000000000000000015B3'
    //     )
    // );

    [deployer] = await hre.ethers.getSigners();
    const ContractF = await hre.ethers.getContractFactory("DummyReceiver");
    const contr = await ContractF.deploy(
        "0x3c2269811836af69497E5F486A85D7316753cf62" // lz endpoint AVAX
        // "0xb6319cC6c8c27A8F5dAF0dD3DF91EA35C4720dd7" // lz endpoint FTM
        // "0x3c2269811836af69497E5F486A85D7316753cf62" // lz endpoint BSC
    );

    await contr.deployed();

    console.log("DummyReceiver deployed to: %saddress/%s", hre.network.config.explorer, contr.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
