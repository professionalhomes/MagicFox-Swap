const hre = require("hardhat");
const { upgrades } = require("hardhat");
const proxyAdminABI = require('./../abi-proxy-admin');

async function main() {
  const addresses = hre.network.config.constants;
  const signer = (await hre.ethers.getSigners())[0];
  const proxyAdmin = new hre.ethers.Contract(addresses.proxyAdmin, proxyAdminABI, signer);

  const transaction = await proxyAdmin.transferOwnership('xxx');
    
  console.log("transferOwnership to: %stx/%s", hre.network.config.explorer, transaction.hash);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
