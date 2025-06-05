const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const deployer = (await hre.ethers.getSigners())[0];

    // const ContractF = await hre.ethers.getContractFactory("RewardsDistributorHelper");
    // const contr = await ContractF.deploy();

    // await contr.deployed();

    // console.log("RewardsDistributorHelper deployed to: %saddress/%s", hre.network.config.explorer, contr.address);

    const TOKEN_ID = 12;

    const REWARD_DIST = await hre.ethers.getContractAt('RewardsDistributor', addresses.rewardDistributorUsdc, deployer);

    const res = await REWARD_DIST.claimable(TOKEN_ID);
    console.log(res);

    const REWARD_DIST_H = await hre.ethers.getContractAt('RewardsDistributorHelper', '0x7ee6039dEA53D81DAb2F904EDeB8f992cd13965C', deployer);

    const res2 = await REWARD_DIST_H.claimableNow(addresses.rewardDistributorUsdc, TOKEN_ID, addresses.veToken);
    console.log(res2);

    const res3 = await REWARD_DIST_H.claimableNextEpoch(addresses.rewardDistributorUsdc, TOKEN_ID, addresses.veToken);
    console.log(res3);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
