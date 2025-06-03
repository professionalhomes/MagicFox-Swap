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
    chainlinkEpochController: '0x7c5106bd2C1cC55b17A0F384B5C7E2C67121CcBA',
    chainlinkWeeklyEmissionBridge_ARBITRUM: '0xD1Bb06d224d4193D3b8db1558d7e3F2B1711efbE',
    chainlinkWeeklyEmissionBridge_POLYGON: '0x66D95d405e157fb199565F2fB127453649A3C003',
    bluechipFeeCollector: '0xa2d23C7Ca6D360D5B0b30CaFF79dbBfa242B4811', 
    voterFeeClaimer: '0x4a36b507D1b5a17dDFa16044E922D15625871310', 

    /* dao */
    bribeFactory: '0x2295277c1AE8314387289E7E506407B9332c1500', 
    gaugeFactory: '0x69B62Fc3Ab3c1571E47CD3bc8A86E91426667914', 
    voter: '0xF2Fc2b5950f323ad90A210f9f1264392261d3Ae9', // !!!! VERIFY IN CODE HARD-CODED LZ ENDPOINT ADDRESS !!!!
    bluechipVoter: '0x8C246E013C719070c902544B4d27f104a82A15f9',  // !!!! VERIFY IN CODE HARD-CODED LZ ENDPOINT ADDRESS !!!!
    rewardDistributorToken: '0xeF6567279F6dF45d01601D78c21BAB3ffc469533', 
    rewardDistributorUsdc: '0xBd7A8c05D0eB214e3C5cc63D4B77C2Ea38bDe440', 
    minter: '0x3Ab6c1800B7878be6E890798C9F0282c8AA43E39', 

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
    token: '0x84E0a246DD437d911989E89667816A9Ed97a1284', 
    veToken: '0x4b749A14e8A1cC008eD7c89F7652537065191bbd', 

    /* chainlink */
    bluechipFeeCollector: '0xfC282bc7004DF6d1ec342A676354575dcd4EE974', 
    voterFeeClaimer: '0x2746655AfE725CA114a45D3fadF08f10fB0bb57a', 

    /* dao */
    bribeFactory: '0x298e40a026F4db34b57CBDB7c5F22f2d9BaF935d', 
    gaugeFactory: '0xd614F630F18602dDd08b41728058E94427475cd5', 
    voter: '0x6a07Cc5C621d8A1f8Ce25f449B49FaAD5dCBb8Ee',
    bluechipVoter: '0xcb8Edbe8028A026cED02b1160e43166B62305beF',
    lzReceiver: '0xAFD9748AAD1ceC527723f5104B9D9Ad94d7DE0A7', 
    lzReceiverBluechip: '0x2498F6668b7970F42e4AB93d50E501e5ed513264', 

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
    token: '0x84E0a246DD437d911989E89667816A9Ed97a1284', 
    veToken: '0x851e951FD4Fb85710002C76376F7Fd5d9cff61A4', 

    /* chainlink */
    bluechipFeeCollector: '0xeBF77693c6531546E79c2D3426D541270bCDb434', 
    voterFeeClaimer: '0xC82AAfB906ecB40f3cfF3675391f0b370c66afcf', 

    /* dao */
    bribeFactory: '', 
    gaugeFactory: '0x79c86a3E7921Bea8b2344eDB0A34Ef1e22aa73C8', 
    voter: '0xfC282bc7004DF6d1ec342A676354575dcd4EE974',
    bluechipVoter: '0x41c42D2AA40013962d1C184a47606e4718259ff8',
    lzReceiver: '0x6a07Cc5C621d8A1f8Ce25f449B49FaAD5dCBb8Ee', 
    lzReceiverBluechip: '0xcb8Edbe8028A026cED02b1160e43166B62305beF', 

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
    usdc: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',

    /* LPs */
  }
};
