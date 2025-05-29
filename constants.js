module.exports = {
  BSC: {
    /* swap */
    pairFactory: '0x407a4cDA343037FBCF7fdAEC97e0a8597437c860', 
    swapRouter: '0x654F131605Fb2e8DB48bAD8a4077973DfFDDA01C', 

    /* token */
    token: '0xB48837F0C05c0931c7B3DcFDceA0365396c39F3A', 
    proxyOFT: '0x8f29cFBE5b112C18D1eF73C2a925F5BE6a3f5b62', 
    veArt: '0xd0f4f8b8cEd19E82b8461ada452fF9B116E5F717', 
    veToken: '0xb241D311f1114ECb6E210c40b0F2040AC8cD485e', 

    /* fairlaunch */
    fairlaunch: '0xa589e8874fF691bd6B9D19b545722791CE532fFD', 
    fairlaunchZap: '0x8B0D70d8C3ef0B91F6f33d1715a3790cC1b6E3B1', 
    treasury: '0x16a22488426742CDe589BC1D299D55BfaF28093d', 
    shroom: '0x827D4BE081b7bB2a1e3338d56F4197f31DfD6250', 
    veShroom: '0xD588e41f409B0062647EaBB6cC09e35D6d93AC70', 

    /* chainlink */
    chainlinkEpochController: '0x18aC685D8D40eCBA614dcae0EBc35313DFD2eD84',
    chainlinkWeeklyEmissionBridge: '0x23078c78E09A9abC3C44f9b457cD98D0E5Ea3491',

    /* dao */
    bribeFactory: '0xAa3e74d0729227a232e198C98Dfd5ab813b23b37', 
    gaugeFactory: '0x52Af90A31e7a5a1c66b6BAF59719d289BcfE3e3D', 
    voter: '0xA1F9946f2Bbb11a0719e758693992A181e6B7723', // !!!! VERIFY IN CODE HARD-CODED LZ ENDPOINT ADDRESS !!!!
    bluechipVoter: '0xE97dCA1786Aaf17Ab4aE9c1eE78eC97881396968',  // !!!! VERIFY IN CODE HARD-CODED LZ ENDPOINT ADDRESS !!!!
    bluechipFeeCollector: '0x19202546c2A6ee04bf13883eCc87f678DcE618Cf', 
    rewardDistributorToken: '0xB420D9C0993B23D650C66F9FeAEb760104E8058B', 
    rewardDistributorUsdc: '', 
    minter: '0x933222F9E9c6d35EC39Eac890B480505931C93D9', 

    /* LZ */
    lzChainId: 102,
    lzEndpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',

    /* UpgradableContracts admin */
    timelocker: '',
    proxyAdmin: '0x78AE0bACB5771E265Fe530A4EF9DDDbD3467f6eb', // still need to transfer ownership from deployer to timelocker

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

  ARBITRUM: {
    /* swap */
    pairFactory: '0x407a4cDA343037FBCF7fdAEC97e0a8597437c860', 
    swapRouter: '0x654F131605Fb2e8DB48bAD8a4077973DfFDDA01C', 
    solidlyLib: '0xB48837F0C05c0931c7B3DcFDceA0365396c39F3A',

    /* token */
    token: '0x6EB19f9D45DD3aa8fED5A5F30434F4c3858973CA', 
    veToken: '0x78AE0bACB5771E265Fe530A4EF9DDDbD3467f6eb', 

    /* dao */
    bribeFactory: '0xb241D311f1114ECb6E210c40b0F2040AC8cD485e', 
    gaugeFactory: '0xAa3e74d0729227a232e198C98Dfd5ab813b23b37', 
    voter: '0x529894865034cd9E5E6D3ed74769878Ce4c2A774',
    bluechipVoter: '0x75B7Df866eD541398b77b8059cb09DcE35460736',
    bluechipFeeCollector: '0xEf187603caAfF55D27ade3F2a291AfE49f83c054', 
    lzReceiver: '0xE97dCA1786Aaf17Ab4aE9c1eE78eC97881396968', 
    lzReceiverBluechip: '0xB420D9C0993B23D650C66F9FeAEb760104E8058B', 

    /* LZ */
    lzChainId: 110,
    lzEndpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',

    /* UpgradableContracts admin */
    timelocker: '',
    proxyAdmin: '0x4d5DC125BA9a9330d983DD4C0B915Cb726D7f2D5', // still need to transfer ownership from deployer to timelocker

    /* ERC20 */
    wnative: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    usdt: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    usdc: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',

    /* LPs */
    foxLP_volatile_USDC_WETH: '0xf82C9f8EeF2f4078583a780Abd82Ff2BF342183e',
    foxLP_volatile_USDT_USDC: '0x83d91b9b0415F88192182255B239c5061445DE6D',
    foxLP_volatile_USDT_WETH: '0xd0aFBD4B188266D091A4199933E5ABf5Fe340bF4',
  },

  POLYGON: {
    /* swap */
    pairFactory: '0x78AE0bACB5771E265Fe530A4EF9DDDbD3467f6eb', 
    swapRouter: '0xd0f4f8b8cEd19E82b8461ada452fF9B116E5F717', 
    solidlyLib: '0xb241D311f1114ECb6E210c40b0F2040AC8cD485e',

    /* token */
    token: '0xe68A494F2481A936760B8adbA083F786b30fB767', 
    veToken: '0x52Af90A31e7a5a1c66b6BAF59719d289BcfE3e3D', 

    /* dao */
    bribeFactory: '0xA1F9946f2Bbb11a0719e758693992A181e6B7723', 
    gaugeFactory: '0x89e888B917B409d7F98251122f5240af97070849', 
    voter: '0xb36c546050a4e421a1054EF23043AD03bd3cF3B3',
    bluechipVoter: '0x933222F9E9c6d35EC39Eac890B480505931C93D9',
    bluechipFeeCollector: '0xE97dCA1786Aaf17Ab4aE9c1eE78eC97881396968', 
    lzReceiver: '0x04Ba64b35870fa9E2485dCc5970d4CcB6Ae7cdEb', 
    lzReceiverBluechip: '0xBCFBAA9e145B5439DE8e111f3344FCeb51dd51c9', 

    /* LZ */
    lzChainId: 109,
    lzEndpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',

    /* UpgradableContracts admin */
    timelocker: '',
    proxyAdmin: '', // still need to transfer ownership from deployer to timelocker

    /* ERC20 */
    wnative: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    wmatic: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    usdt: '',
    usdc: '',

    /* LPs */
  }
};
