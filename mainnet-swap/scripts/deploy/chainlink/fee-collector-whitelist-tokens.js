const hre = require("hardhat");

async function main() {
  const addresses = hre.network.config.constants;
  const deployer = (await hre.ethers.getSigners())[0];

  const FEE_COLLECTOR = await hre.ethers.getContractAt('FeeCollector', addresses.bluechipFeeCollector, deployer);
  
  let tx;
  // tx = await FEE_COLLECTOR.setTokenMapping(
  //   addresses.usdt,
  //   [{from: addresses.usdt, to: addresses.usdc, stable: true}]
  // );
  // await tx.wait();
  // console.log("setTokenMapping USDT");

  tx = await FEE_COLLECTOR.setTokenMapping(
    addresses.wbnb,
    [{from: addresses.wbnb, to: addresses.usdc, stable: false}]
  );
  await tx.wait();
  console.log("setTokenMapping WBNB");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
