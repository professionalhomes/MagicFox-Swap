const hre = require("hardhat");

async function main() {
    const addresses = hre.network.config.constants;
    const investor = (await hre.ethers.getSigners())[1];

    const TOKEN = await hre.ethers.getContractAt('Token', addresses.token, investor);
    const VE = await hre.ethers.getContractAt('VotingEscrow', addresses.veToken, investor);

    // let tx;
    // tx = await TOKEN.approve(VE.address, ethers.constants.MaxUint256);
    // await tx.wait();
    // console.log("TOKEN max approve to VotingEscrow");
    
    tx = await VE.create_lock(ethers.utils.parseUnits('100.00', 18), 2 * 365 * 86400);
    await tx.wait();
    console.log("100 tokens locked for 2 years");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
