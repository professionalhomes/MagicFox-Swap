module.exports = {
  BSC: {
    /* general */
    weth: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    usdt: '0x55d398326f99059fF775485246999027B3197955',
    usdc: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',

    /* LPs */
    foxLP_volatile_PH_WBNB: '',
    foxLP_stable_USDC_USDT: '',
    foxLP_stable_USDC_WBNB: '',

    /* swap */
    pairFactory: '0x407a4cDA343037FBCF7fdAEC97e0a8597437c860', 
    swapRouter: '0x654F131605Fb2e8DB48bAD8a4077973DfFDDA01C', 

    /* token */
    token: '0xB48837F0C05c0931c7B3DcFDceA0365396c39F3A', 
    proxyOFT: '0x8f29cFBE5b112C18D1eF73C2a925F5BE6a3f5b62', 
    veArt: '0xd0f4f8b8cEd19E82b8461ada452fF9B116E5F717', 
    veToken: '0xb241D311f1114ECb6E210c40b0F2040AC8cD485e', 

    /* presale */
    presale: '', 
    treasury: '', 
    shroom: '', 
    veShroom: '', 

    /* chainlink */
    chainlinkEpochController: '',
    chainlinkWeeklyEmissionBridge: '',

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
    proxyAdmin: '0x78AE0bACB5771E265Fe530A4EF9DDDbD3467f6eb' // still need to transfer ownership from deployer to timelocker
  },

  ARBITRUM: {
    /* general */
    weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    usdt: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    usdc: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',

    foxLP_volatile_PH_WETH: '',
    foxLP_volatile_PH_USDC: '',

    /* swap */
    pairFactory: '', 
    swapRouter: '', 

    /* token */
    token: '', 
    veArt: '', 
    veToken: '', 

    /* dao */
    bribeFactory: '', 
    gaugeFactory: '', 
    voter: '',
    bluechipVoter: '',
    bluechipFeeCollector: '', 
    lzReceiver: '', 
    lzReceiverBluechip: '', 

    /* LZ */
    lzChainId: 110,
    lzEndpoint: '0x3c2269811836af69497E5F486A85D7316753cf62',

    /* UpgradableContracts admin */
    timelocker: '',
    proxyAdmin: '' // still need to transfer ownership from deployer to timelocker
  }
};
