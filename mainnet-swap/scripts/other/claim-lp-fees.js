const hre = require("hardhat");
const path = require('path');
const scriptName = path.basename(__filename);
const addresses = hre.network.config.constants;

async function main() {
    
    const deployer = (await hre.ethers.getSigners())[0];

    const factory = await hre.ethers.getContractAt('PairFactory', addresses.pairFactory, deployer);

    const pairs = await factory.pairs();

    let cnt = 0;
    for (pairAddress of pairs) {
      cnt++;
      // if (cnt < 6) {
      //   continue;
      // }
      const pair = await hre.ethers.getContractAt('Pair', pairAddress, deployer);
      const symbol = await pair.symbol();
      const tx = await pair.claimOwnerFees();
      await tx.wait();
      console.log(`${symbol} (${symbol}) => claimed`);
    }

    console.log("fees claimed!");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
