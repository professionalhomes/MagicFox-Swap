module.exports = {
  BSC: {
    /* swap */
    pairFactory: '0xfB7919F2a30Ebdd4167097A253EE1eD3F308cF19', 
    swapRouter: '0xf4850d24f75EbDFfC96543C11243108C7c150230', 
    solidlyLib: '0x52Be51eA84f51c521132b63B025Fcd40fDf3D840',

    /* token */
    token: '0x84E0a246DD437d911989E89667816A9Ed97a1284', 
    proxyOFT: '0xCAB0838EAF7C34ba8C6713b7f395c36df33A1c54', 
    veArt: '0x79c86a3E7921Bea8b2344eDB0A34Ef1e22aa73C8', 
    veToken: '0x4b749A14e8A1cC008eD7c89F7652537065191bbd', 

    /* fairlaunch */
    fairlaunch: '', 
    fairlaunchZap: '', 
    treasury: '', 
    shroom: '', 
    veShroom: '', 

    /* chainlink */
    chainlinkEpochController: '',
    chainlinkWeeklyEmissionBridge: '',

    /* dao */
    bribeFactory: '', 
    gaugeFactory: '', 
    voter: '', // !!!! VERIFY IN CODE HARD-CODED LZ ENDPOINT ADDRESS !!!!
    bluechipVoter: '',  // !!!! VERIFY IN CODE HARD-CODED LZ ENDPOINT ADDRESS !!!!
    bluechipFeeCollector: '', 
    rewardDistributorToken: '', 
    rewardDistributorUsdc: '', 
    minter: '', 

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
  },

  ARBITRUM: {
    /* swap */
    pairFactory: '', 
    swapRouter: '', 
    solidlyLib: '',

    /* token */
    token: '', 
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
    proxyAdmin: '', // still need to transfer ownership from deployer to timelocker

    /* ERC20 */
    weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    usdt: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    usdc: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',

    /* LPs */
  }
};
