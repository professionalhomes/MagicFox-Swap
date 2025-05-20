const hre = require("hardhat");

async function main() {
    const GAUGEContract = await ethers.getContractFactory("GaugeFactoryV2");
    const GAUGE_F = await upgrades.deployProxy(GAUGEContract, []);
    await GAUGE_F.deployed();

    console.log("GaugeFactoryV2 deployed to: %saddress/%s", hre.network.config.explorer, GAUGE_F.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
