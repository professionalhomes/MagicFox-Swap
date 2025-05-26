const constants = require("./constants.js");

module.exports = {

  /**
   * BSC - VOTER pools
   */
  BSC_VOTER: {
    // pool0: {
    //   lp: constants.BSC.foxLP_volatile_PH_WBNB,
    //   gauge: '',
    // },
    // pool1: {
    //   lp: ,
    //   gauge: '',
    // },
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
    // pool0: {
    //   lp: constants.BSC.foxLP_stable_USDC_WBNB,
    //   gauge: '0x36F13d15eCF611dA0c3e48F952ad35CD35eb7088',
    // },
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
