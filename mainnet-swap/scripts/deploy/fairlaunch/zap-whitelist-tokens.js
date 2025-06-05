const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const signer = (await hre.ethers.getSigners())[0];

    const ZAP = await hre.ethers.getContractAt('FairlaunchZap', '0x1bd99249fB4dd646b0a9a7e8d77fAeC4124f75eA', signer);
    //const FAIRLAUNCH = await hre.ethers.getContractAt('Fairlaunch', addresses.fairlaunch, signer);

    let tx;
    tx = await ZAP.whitelistTokens(
        [addresses.weth, addresses.usdc, addresses.usdt, addresses.busd, addresses.btcb],
        true
    );
    await tx.wait();
    console.log('ZAP.whitelistTokens');
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
