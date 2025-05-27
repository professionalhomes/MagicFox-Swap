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
      // foxLP_volatile_PH_WBNB
      gauge: '0x5D8C2F4FfFC7683dF539a9883c3e6c149A889eB1',
    },
    pool3: {
      // ARBITRUM volatile_USDC_WETH
      gauge: '0x95B896918BF60336526883117f7461fBbb766682',
      chainId: constants.ARBITRUM.lzChainId
    },
  },

  /**
   * ARBITRUM - VOTER pools
   */
  ARBITRUM_VOTER: {
    pool0: {
      // volatile_USDC_WETH
      gauge: '0x002323A44DeB866E4503c2757B6598CC346C1C83',
    },
  },

  /**
   * BSC - BLUECHIP pools
   */
  BSC_BLUECHIP: {
    pool0: {
      // foxLP_stable_USDT_USDC
      gauge: '0x768C0616dA2445cb4033400c92B6a3B9DCfc4013',
      allocPts: 750,
    },
    pool1: {
      // ARBITRUM stable_USDC_USDT
      gauge: '0xeDf861C221735Af71C3C00638465645A58a5405d',
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
  }
};
