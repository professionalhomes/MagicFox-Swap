const constants = require("./constants.js");

module.exports = {

  /**
   * BSC - VOTER pools
   */
  BSC_VOTER: {
    pool0: {
      lp: constants.BSC.foxLP_volatile_PH_WBNB,
      gauge: '0xc72F70898C04E0516f7062c8D627Ee055B115A23',
    },
    pool1: {
      lp: constants.BSC.foxLP_stable_USDC_USDT,
      gauge: '0xf774fc733E6ff12B1089DE750019ab06130896E5',
    },
    pool2: {
      // ARBITRUM pool
      lp: '', // Not in use in hardhat
      gauge: '0x26Ca9705D099da73C95491f6aEdc45b8639CAb69',
      chainId: constants.ARBITRUM.lzChainId
    },
  },

  /**
   * BSC - BLUECHIP pools
   */
  BSC_BLUECHIP: {
    pool0: {
      lp: constants.BSC.foxLP_stable_USDC_WBNB,
      gauge: '0x36F13d15eCF611dA0c3e48F952ad35CD35eb7088',
    },
    pool1: {
      // ARBITRUM pool
      lp: '', // Not in use in hardhat
      gauge: '0xf2f79176c800C700f6274d5eED7233A9Ce3ac8Dc',
      chainId: constants.ARBITRUM.lzChainId
    },
  },

  /**
   * ARBITRUM - VOTER pools
   */
  ARBITRUM_VOTER: {
    pool0: {
      lp: constants.ARBITRUM.foxLP_volatile_PH_WETH,
      gauge: '0x820554a9B9606b1f869cf92c751A7393E587B828',
    },
    pool1: {
      // NOT IN USE !!! -- failed deployment
    },
  },

  /**
   * ARBITRUM - BLUECHIP pools
   */
  ARBITRUM_BLUECHIP: {
    pool0: {
      lp: constants.ARBITRUM.foxLP_volatile_PH_USDC,
      gauge: '0x1C74181633a3BB53A57ff6102681FFb2Cdb48472',
    },
  }
};
