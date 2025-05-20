const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const deployer = (await hre.ethers.getSigners())[0];
    const investor = (await hre.ethers.getSigners())[1];

    // const VOTER = await hre.ethers.getContractAt('VoterV2_1', addresses.voter, investor);
    // tx = await VOTER.vote(
    //     1, // NFT
    //     [addresses.foxLP_volatile_PH_WBNB, addresses.foxLP_stable_USDC_USDT],
    //     [50, 100]
    // );

    const VOTER = await hre.ethers.getContractAt('BluechipVoter', addresses.bluechipVoter, deployer);
    tx = await VOTER.vote(
        [addresses.foxLP_stable_USDC_WBNB],
        [100]
    );
    await tx.wait();
    console.log("voted successfully");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
