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
    fairlaunch: '0x2498F6668b7970F42e4AB93d50E501e5ed513264', 
    fairlaunchZap: '0xcb8Edbe8028A026cED02b1160e43166B62305beF', 
    treasury: '0x0b013649982c9f2623eC15d4fFF62EC1cB6Dc8e5', 
    shroom: '0x967F4B82D8B7eD38f655CCf084150180c8165AC5', 
    veShroom: '0x6a07Cc5C621d8A1f8Ce25f449B49FaAD5dCBb8Ee', 

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
    weth: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    busd: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    btcb: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',

    /* LPs */
  },

  ARBITRUM: {
    /* swap */
    pairFactory: '0xfB7919F2a30Ebdd4167097A253EE1eD3F308cF19', 
    swapRouter: '0xf4850d24f75EbDFfC96543C11243108C7c150230', 
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
    wnative: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    usdt: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    usdc: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',

    /* LPs */
  },

  POLYGON: {
    /* swap */
    pairFactory: '0xfB7919F2a30Ebdd4167097A253EE1eD3F308cF19', 
    swapRouter: '0xf4850d24f75EbDFfC96543C11243108C7c150230', 
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
