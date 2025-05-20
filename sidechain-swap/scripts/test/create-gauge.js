const hre = require("hardhat");
const pools = require("../../../pools.js");
const { exit } = require("process");
const constants = require("../../../constants.js");

async function main() {
    const addresses = hre.network.config.constants;
    const deployer = (await hre.ethers.getSigners())[0];

    const VOTER = await hre.ethers.getContractAt('VoterV2_1', addresses.voter, deployer);
    const BLUECHIP_VOTER = await hre.ethers.getContractAt('BluechipVoter', addresses.bluechipVoter, deployer);

    const postfix = 'VOTER';

    const mainchainPool = pools[`BSC_${postfix}`].pool2;
    const sidechainPool = pools[`ARBITRUM_${postfix}`].pool0;
    if (mainchainPool?.chainId !== constants.ARBITRUM.lzChainId) {
        console.log("Invalid chain ID");
        exit();
    }

    const exists_1 = await VOTER.gauges(sidechainPool.lp);
    const exists_2 = await BLUECHIP_VOTER.gauges(sidechainPool.lp);
    if (
        exists_1 != hre.ethers.constants.AddressZero || 
        exists_2 != hre.ethers.constants.AddressZero
    ) {
        console.log('---------------------------------');
        console.log('Gauge for this LP already exists!');
        exit();
    }

    tx = await VOTER.createGauge(sidechainPool.lp, mainchainPool.gauge);
    await tx.wait();
    console.log("gauge created");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
