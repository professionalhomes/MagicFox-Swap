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
    // pool2: {
    //   // ARBITRUM pool
    //   gauge: '',
    //   chainId: constants.ARBITRUM.lzChainId
    // },
  },

  /**
   * ARBITRUM - VOTER pools
   */
  ARBITRUM_VOTER: {
    // pool0: {
    //   lp: constants.ARBITRUM.foxLP_volatile_PH_WETH,
    //   gauge: '',
    // },
  },

  /**
   * BSC - BLUECHIP pools
   */
  BSC_BLUECHIP: {
    pool0: {
      // foxLP_stable_USDT_USDC
      gauge: '0x768C0616dA2445cb4033400c92B6a3B9DCfc4013',
    },
    // pool1: {
    //   // ARBITRUM pool
    //   gauge: '',
    //   chainId: constants.ARBITRUM.lzChainId
    // },
  },

  /**
   * ARBITRUM - BLUECHIP pools
   */
  ARBITRUM_BLUECHIP: {
    // pool0: {
    //   lp: constants.ARBITRUM.foxLP_volatile_PH_USDC,
    //   gauge: '0x1C74181633a3BB53A57ff6102681FFb2Cdb48472',
    // },
  }
};
