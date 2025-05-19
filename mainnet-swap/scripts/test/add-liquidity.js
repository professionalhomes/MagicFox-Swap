const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const investor = (await hre.ethers.getSigners())[1];

    // PH/WBNB
    // const TOKEN1 = await hre.ethers.getContractAt('Token', addresses.token, investor);
    // const TOKEN2 = await hre.ethers.getContractAt('DummyToken', addresses.weth, investor);

    // USDC/USDT
    const TOKEN1 = await hre.ethers.getContractAt('Token', addresses.weth, investor);
    const TOKEN2 = await hre.ethers.getContractAt('Token', addresses.usdc, investor);
    const ROUTER = await hre.ethers.getContractAt('Router', addresses.swapRouter, investor);

    // await TOKEN1.approve(ROUTER.address, ethers.constants.MaxUint256);
    // await TOKEN2.approve(ROUTER.address, ethers.constants.MaxUint256);
    // console.log("Tokens approved");

    await ROUTER.connect(investor).addLiquidity(
        TOKEN1.address,
        TOKEN2.address,
        false, // is stable
        ethers.utils.parseUnits("0.001", 18),
        ethers.utils.parseUnits("1", 18),
        "0",
        "0",
        investor.address,
        2147483647 // year 2038
    );
    console.log("Liquidity added");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
