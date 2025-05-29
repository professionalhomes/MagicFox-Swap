const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const signer = (await hre.ethers.getSigners())[0];

    const ZAP = await hre.ethers.getContractAt('FairlaunchZap', addresses.fairlaunchZap, signer);
    //const FAIRLAUNCH = await hre.ethers.getContractAt('Fairlaunch', addresses.fairlaunch, signer);

    let tx;
    // tx = await ZAP.setFairlaunch(addresses.fairlaunch);
    // await tx.wait();
    // console.log('ZAP.setFairlaunch');

    tx = await ZAP.whitelistTokens(
        [hre.ethers.constants.AddressZero, addresses.weth, addresses.wbnb, addresses.usdt, addresses.busd, addresses.btcb],
        true
    );
    await tx.wait();
    console.log('ZAP.whitelistTokens');
    
    // tx = await FAIRLAUNCH.zapAndBuy(
    //     addresses.usdt, // hre.ethers.constants.AddressZero,
    //     hre.ethers.utils.parseUnits("5"),
    //     [addresses.usdt, addresses.usdc],
    //     hre.ethers.constants.AddressZero, // referral
    //     // {value: hre.ethers.utils.parseUnits("0.0152")}
    // );
    // await tx.wait();
    // console.log("ZAP.convert");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
