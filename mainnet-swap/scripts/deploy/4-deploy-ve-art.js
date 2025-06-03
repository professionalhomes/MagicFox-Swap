const hre = require("hardhat");

async function main() {
    const ArtContract = await hre.ethers.getContractFactory("VeArt");
    const ART = await upgrades.deployProxy(ArtContract, []);
    await ART.deployed();

    console.log("VeArt deployed to: %saddress/%s", hre.network.config.explorer, ART.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
