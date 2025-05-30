const constants = require("./constants.js");

module.exports = {

  /**
   * BSC - VOTER pools
   */
  BSC_VOTER: {
    pool0: {
      // foxLP_volatile_USDC_WBNB
      gauge: '0xD75Ef952786038198F416Cf312568BEda3a7ba60',
    },
    pool1: {
      // foxLP_volatile_USDT_BUSD
      gauge: '0x4B666e3Fe15fcaeE5bBaa865caf076cc6781EB20',
    },
    pool2: {
      // foxLP_volatile_PH_WBNB -- old LP
      gauge: '0x5D8C2F4FfFC7683dF539a9883c3e6c149A889eB1',
    },
    pool3: {
      // ARBITRUM volatile_USDC_WETH
      gauge: '0x95B896918BF60336526883117f7461fBbb766682',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '0x002323A44DeB866E4503c2757B6598CC346C1C83',
    },
    pool4: {
      // foxLP_volatile_PH_WBNB -- NEW
      gauge: '0x78cfF03c1e9CC21DA28859B0884E162Fc51d9e66',
    },
    pool5: {
      // POLYGON volatile_WMATIC_USDC
      chainId: constants.POLYGON.lzChainId,
      gauge: '0xd0Aa19B90522cd94E387266539b5EbfE970e3Deb',
      sideGauge: '0xDB225FFa9e4002ac77ae030853DbFcACbd0Af0EC',
    },
    pool6: {
      // POLYGON volatile_PH_WMATIC
      chainId: constants.POLYGON.lzChainId,
      gauge: '0xf6149da93Aa3D34B8AD6064C64910B01D1332fFb',
      sideGauge: '0xD9cB687c3394101F7AaDb79f2D68C751DC135ee0',
    },
  },

  /**
   * BSC - BLUECHIP pools
   */
  BSC_BLUECHIP: {
    pool0: {
      // foxLP_stable_USDT_USDC
      gauge: '0x768C0616dA2445cb4033400c92B6a3B9DCfc4013',
      allocPts: 500,
    },
    pool1: {
      // ARBITRUM stable_USDC_USDT
      gauge: '0xeDf861C221735Af71C3C00638465645A58a5405d',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '0x5b39b92328eFA9fF1Fc101d9B70f8a246C2bE892',
      allocPts: 250,
    },
    pool2: {
      // ARBITRUM volatile_USDT_WETH
      gauge: '0xD91949741f7fcfAC047F07900Ce9c2414A2D7368',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '',
      allocPts: 0,
    },
    pool3: {
      // ARBITRUM volatile_USDT_WETH
      gauge: '0xF537091fEa9E82000f08C48a82bb555310643F12',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '',
      allocPts: 0,
    },
    pool4: {
      // ARBITRUM volatile_USDT_WETH
      chainId: constants.ARBITRUM.lzChainId,
      gauge: '0xbd668B4e4832665E16A80A0a379CD0B87dE500Cb',
      sideGauge: '0x59EbAc4AfA8cab728301b5733280C605640E8E88',
      allocPts: 250,
    },
    pool5: {
      // POLYGON volatile_WMATIC_USDT
      chainId: constants.POLYGON.lzChainId,
      gauge: '0x6aCb815fE5ff865cfFEC4c6cf3d46E5244633844',
      sideGauge: '0x2c7BEB38058B57730c6a735aD76CF6F78F8eF2d5',
      allocPts: 500,
    },
  },
};
