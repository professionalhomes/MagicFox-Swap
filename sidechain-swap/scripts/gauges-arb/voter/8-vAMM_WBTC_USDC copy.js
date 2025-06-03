const hre = require("hardhat");
const path = require('path');
const scriptName = path.basename(__filename);
const addresses = hre.network.config.constants;
const constants = require("../../../../constants.js");
const pools = require("../../../../pools.js");

async function main() {
    
    const POOL_LP = addresses.vAMM_WBTC_USDC;
    const MAINCHAIN_GAUGE = pools.BSC_VOTER.pool14;

    /* !!! Don't change the code below !!! */
    /* !!! Don't change the code below !!! */
    /* !!! Don't change the code below !!! */

    const PID = scriptName.split('-')[0];
    const deployer = (await hre.ethers.getSigners())[0];
    const VOTER = await hre.ethers.getContractAt('VoterV2_1', addresses.voter, deployer);
    const poolLength = await VOTER.length();

    console.log(`Add gauge: ${scriptName}`);

    if (MAINCHAIN_GAUGE.chainId != addresses.lzChainId) {
        console.log('INCORRECT lzChainID!');
        return;
    }

    if (poolLength != PID) {
        console.log('INCORRECT PID!');
        console.log(`Contract expecting PID: ${poolLength}`);
        console.log(`You're trying to add PID: ${PID}`);
        return;
    }

    tx = await VOTER.createGauge(POOL_LP, MAINCHAIN_GAUGE.gauge);
    await tx.wait();
    console.log("gauge created");
    const gauge = await VOTER.gaugeList(PID);
    console.log(`gauge address: ${gauge}`);

    // base, _ve, _pool, address(this), _internal_bribe, _external_bribe, address(0), isPair

    // 0xf83C6b4D7cbE88503ee36849b5bD19830A6170B9 // base
    // 0xfB7c10D38acbda7DfB464f3781725ffd701B00Ec // ve
    // 0xEe30CfE5B70aAa6e1cFA6EE954DDE14207D4f56B // foxLP_stable_USDC_WBNB
    // 0x03D8b7D195b98D1526f149ff99527875fD18E4C6 // bluechipvoter
    // 0xfA09231Ae1845447d33F30A7FE8260dF039f86ab // internal bribe !!!
    // 0xa0E7C14EE61AdeEDF807D88e2B5A88D9ae759E2d // external bribe !!!
    // 0x0000000000000000000000000000000000000000 // fee collector
    // true
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
