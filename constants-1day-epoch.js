module.exports = {
  BSC: {
    /* swap */
    pairFactory: '0x407a4cDA343037FBCF7fdAEC97e0a8597437c860', 
    swapRouter: '0x654F131605Fb2e8DB48bAD8a4077973DfFDDA01C', 

    /* token */
    token: '0x705EDfEd4f7ED8551594698edf307B17e14df02C', 
    proxyOFT: '0x0000000000000000000000000000000000000000', 
    veArt: '0x56338AD95Ae7Dcf569A82E8A34Fe773d492eb302', 
    veToken: '0x40478092A44d099f08Cf3794B091483cBb28A5d4', 

    /* fairlaunch */
    fairlaunch: '', 
    fairlaunchZap: '', 
    treasury: '', 
    shroom: '', 
    veShroom: '', 

    /* chainlink */
    chainlinkEpochController: '',
    chainlinkWeeklyEmissionBridge: '',
    chainlinkFeeDistributor: '',

    /* dao */
    bribeFactory: '0x506e31a17E45e7EFE0359A84EbcCC17B8B140e27', 
    gaugeFactory: '0xDB9216998B6FF2FC56577A5852Fa5a59E1D27091', 
    voter: '0x25b7a58Eb878DDD73f97528Af8BDd9761BcfD614', // !!!! VERIFY IN CODE HARD-CODED LZ ENDPOINT ADDRESS !!!!
    bluechipVoter: '0x51EBD7cDCb83a1f57a077Ce15e68464BEa2fCcf2',  // !!!! VERIFY IN CODE HARD-CODED LZ ENDPOINT ADDRESS !!!!
    bluechipFeeCollector: '0x0000000000000000000000000000000000000000', 
    rewardDistributorToken: '0x5f7F1a41ff360f47C682615a8fFC65C5712ca2Ac', 
    rewardDistributorUsdc: '', 
    minter: '0x43Fb2fD0b0473da0964f49E334c66b1ceC987c04', 

    /* LZ */
    lzChainId: 102,
    lzEndpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',

    /* UpgradableContracts admin */
    timelocker: '',
    proxyAdmin: '', // still need to transfer ownership from deployer to timelocker

    /* ERC20 */
    wnative: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    wbnb: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    usdt: '0x55d398326f99059fF775485246999027B3197955',
    usdc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',

    /* LPs */
    foxLP_volatile_USDC_WBNB: '0x06bAF8226fC172158e81F30C9Ff186cB17749543',
    foxLP_volatile_USDT_BUSD: '0xC4Fe3cC91Af574b5255f1079BAd60776181e639F',
    foxLP_stable_USDT_USDC: '0x9592B1B6D156D6a79848607928D60afc6D9e926c',
    foxLP_volatile_PH_WBNB_OLD: '0xB85E0AA0e96f46a93fFEb2d0be22Cb09F191117b',
    foxLP_volatile_PH_WBNB: '0x2A95542462EdDCb429fCed06EAA4BB3fA265ADa7',
  },
};
