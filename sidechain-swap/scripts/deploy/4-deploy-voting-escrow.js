const hre = require("hardhat");
const constants = require("../../../constants.js");

async function main() {
    const addresses = hre.network.config.constants;
    const ContractF = await hre.ethers.getContractFactory("VotingEscrowMirror");
    const MIRROR = await upgrades.deployProxy(ContractF, [
        addresses.token,
        constants.BSC.veToken,
        addresses.lzEndpoint
    ]);
    await MIRROR.deployed();

    console.log("VotingEscrowMirror deployed to: %saddress/%s", hre.network.config.explorer, MIRROR.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
