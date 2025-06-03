const hre = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
  const addresses = hre.network.config.constants;
  const deployer = (await hre.ethers.getSigners())[0];

  const ART = await hre.ethers.getContractFactory("VeArt"); // VeArtFox and VeArtShroom
  const upgraded = await upgrades.upgradeProxy(addresses.veArt, ART);

  console.log(
    "VeArt upgraded to: %saddress/%s",
    hre.network.config.explorer,
    upgraded.address
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
