const hre = require("hardhat");
const path = require('path');
const scriptName = path.basename(__filename);
const addresses = hre.network.config.constants;
const pools = require("../../../../pools.js");

async function main() {
    
    const deployer = (await hre.ethers.getSigners())[0];
    const BLUECHIP = await hre.ethers.getContractAt('BluechipVoter', addresses.bluechipVoter, deployer);
    // const gaugeListCnt = await BLUECHIP.length();
    //console.log(gaugeListCnt);

    const voteGauges = [];
    const voteWeights = [];

    for (gauge of Object.keys(pools.BSC_BLUECHIP)) {
        const pool = pools.BSC_BLUECHIP[gauge];

        if(pool?.allocPts > 0) {
            voteGauges.push(pool.gauge);
            voteWeights.push(pool.allocPts);
            console.log(`${pool.gauge} => ${pool.allocPts}`);
        }
    }

    tx = await BLUECHIP.vote(voteGauges, voteWeights);
    await tx.wait();
    console.log("alloc pts set!");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
