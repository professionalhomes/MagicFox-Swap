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
  },

  // /**
  //  * ARBITRUM - VOTER pools
  //  */
  // ARBITRUM_VOTER: {
  //   pool0: {
  //     // volatile_USDC_WETH
  //     gauge: '0x002323A44DeB866E4503c2757B6598CC346C1C83',
  //   },
  // },

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
      allocPts: 250,
    },
    pool2: {
      // ARBITRUM volatile_USDT_WETH
      gauge: '0xD91949741f7fcfAC047F07900Ce9c2414A2D7368',
      chainId: constants.ARBITRUM.lzChainId,
      allocPts: 0,
    },
    pool3: {
      // ARBITRUM volatile_USDT_WETH
      gauge: '0xF537091fEa9E82000f08C48a82bb555310643F12',
      chainId: constants.ARBITRUM.lzChainId,
      allocPts: 0,
    },
    pool4: {
      // ARBITRUM volatile_USDT_WETH
      gauge: '0xbd668B4e4832665E16A80A0a379CD0B87dE500Cb',
      chainId: constants.ARBITRUM.lzChainId,
      allocPts: 250,
    },
  },

  /**
   * ARBITRUM - BLUECHIP pools
   */
  ARBITRUM_BLUECHIP: {
    pool0: {
      // stable_USDC_USDT
      gauge: '0x5b39b92328eFA9fF1Fc101d9B70f8a246C2bE892',
    },
    pool1: {
      // volatile_USDT_WETH
      gauge: '0xf6d6F62c1662Cf6288A219ba0607e9A531fe9C8A',
    },
    pool2: {
      // volatile_USDT_WETH
      gauge: '0x9e431Aa1bA796E7A9d507D832E53e5E0AD4D80A6',
    },
    pool3: {
      // volatile_USDT_WETH
      gauge: '0x59EbAc4AfA8cab728301b5733280C605640E8E88',
    },
  }
};
