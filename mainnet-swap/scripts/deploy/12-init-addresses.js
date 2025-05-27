const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const deployer = (await hre.ethers.getSigners())[0];
    
    const BRIBE_F = await hre.ethers.getContractAt('BribeFactoryV2', addresses.bribeFactory, deployer);
    const VE = await hre.ethers.getContractAt('VotingEscrow', addresses.veToken, deployer);
    const TOKEN = await hre.ethers.getContractAt('Token', addresses.token, deployer);
    const VOTER = await hre.ethers.getContractAt('VoterV2_1', addresses.voter, deployer);
    const BLUECHIP_VOTER = await hre.ethers.getContractAt('BluechipVoter', addresses.bluechipVoter, deployer);
    const REWARD_DIST = await hre.ethers.getContractAt('RewardsDistributor', addresses.rewardDistributorToken, deployer);
    
    let tx;
    tx = await BRIBE_F.setVoter(addresses.voter);
    await tx.wait();
    console.log("BRIBE_F.setVoter success");

    tx = await VE.setVoter(addresses.voter, addresses.bluechipVoter);
    await tx.wait();
    console.log("VE.setVoter success");

    tx = await TOKEN.setMinter(addresses.minter);
    await tx.wait();
    console.log("TOKEN.setMinter success");

    tx = await VOTER.setMinter(addresses.minter);
    await tx.wait();
    console.log("VOTER.setMinter success");

    tx = await BLUECHIP_VOTER.setMinter(addresses.minter);
    await tx.wait();
    console.log("BLUECHIP_VOTER.setMinter success");

    tx = await REWARD_DIST.setDepositor(addresses.minter);
    await tx.wait();
    console.log("REWARD_DIST.setDepositor success");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
