const constants = require("./constants.js");

module.exports = {

  /**
   * BSC - VOTER pools
   */
  BSC_VOTER: {
    pool0: {
      // foxLP_stable_bnbx_wbnb
      gauge: '0x47B2a7B851e3a07792BC7A9c4bA53278E1B5a57a',
    },
    pool1: {
      // foxLP_stable_wbnb_rbnb
      gauge: '0xaD6F39c4659cBa35e31b25F704D91361Eb979F3b',
    },
    pool2: {
      // foxLP_volatile_acsBNB_ACS
      gauge: '0xc478B19445c8FFE2E08F750C8f743a77282EF98A',
    },
    pool3: {
      // foxLP_volatile_agEUR_usdc
      gauge: '0xf8d1405ebAA9FBaeA5e2a6b7F4F7e0Ca1e287496',
    },
    pool4: {
      // foxLP_stable_usdt_busd
      gauge: '0x6fF3Ec3C27a930783Ad5e094399B8Ed5f9496Dc2',
    },
    pool5: {
      // foxLP_volatile_usdt_btcb
      gauge: '0x6Bb553183Efce37562F38A4070225212Fc653270',
    },
    pool6: {
      // ARBITRUM vAMM-SLIZ/slzUSDC
      gauge: '0xF70FF7960Aff1c362ef9f992f4E67Fba452537CE',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '0x3bFe9dc076B293c712d6f53457E3ab4832F0a779',
    },
    pool7: {
      // ARBITRUM sAMM-slzUSDC/USDC 
      gauge: '0xb5d4112446462a3957C83B48693eBfbc1C9aC02C',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '0x82B53854E1dA958D78D0DC3605137aD697388bb1',
    },
    pool8: {
      // ARBITRUM vAMM-ACS/WETH
      gauge: '0xdDCAb60a0b5f21BAD6d436b4bb9276fB5f7D3E2F',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '0x2B281E4Fd8ba939756BdD5Ae836769A1c4B76AfB',
    },
    pool9: {
      // ARBITRUM vAMM-IBEX/WETH
      gauge: '0x11fa46753202591E9585957c1CcBF0F99BEDf20c',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '0x95fF2c347f9Ddb59690901e69C5e206a1ce32573',
    },
    pool10: {
      // ARBITRUM vAMM-IBEX/USDC
      gauge: '0x9d2951ed48378Cd11041c9195A2FF57819ac083D',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '0x103D3Ae5e9c305eE9e19925484bF44453C21AC61',
    },
    pool11: {
      // ARBITRUM vAMM-aOpenX/ARB
      gauge: '0x9825C1e5b5c838DfdA6eDe9BA006143353A018d8',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '0xdf684B89d65c5BB629104493b8f94CD9Ae4a9C14',
    },
    pool12: {
      // ARBITRUM vAMM-agEUR/USDC
      gauge: '0x801b17fF002e418d4aE06c62338234B6fC54CeEb',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '0xde258195e8C84711d1C515c288A7bfb03D9Ce569',
    },
    pool13: {
      // ARBITRUM vAMM-L2DAO/WETH
      gauge: '0x283ee9152F7b5b44f8024b61763137eF8C6cD34d',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '0xC011CF06F7f90F474b9e0674E1104E4D64FC8443',
    },
    pool14: {
      // ARBITRUM vAMM-WBTC/USDC
      gauge: '0x06F3a89742273713deB95A30Db7273926e1904E2',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '0x5847baaA85EB719Bdab28bb018027F339cD6D43d',
    },
    pool15: {
      // ARBITRUM vAMM-WETH/ARB
      gauge: '0x0598b23F1D3fE275DB9e675aD69CF15aD072a8eF',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '0x47456086e52765689927123f04658dc68c92520B',
    },
    pool16: {
      // POLYGON sAMM_WMATIC_rMATIC
      gauge: '0x4d6aE6219E6b9af8b8AD41f41c3584A98323f089',
      chainId: constants.POLYGON.lzChainId,
      sideGauge: '0x70F527b20FB77c11d1548BeB83b0161d1C76312a',
    },
    pool17: {
      // POLYGON sAMM_WMATIC_MaticX
      gauge: '0x765F180b1e75da34Ed27a7652D3eE020E4bC848B',
      chainId: constants.POLYGON.lzChainId,
      sideGauge: '0xdBDF12f5b3E629c45C5E5Bc65793fBCE5884b8e3',
    },
    pool18: {
      // POLYGON vAMM_USDC_IBEX
      gauge: '0x6Ab3a4a893eCC200054B96E9C09E23212d8F56E4',
      chainId: constants.POLYGON.lzChainId,
      sideGauge: '0x39E82015B1BB56893cB82786CD4c2765611bF606',
    },
    pool19: {
      // POLYGON vAMM_WMATIC_IBEX
      gauge: '0xc27aEB25c30829Bf117cF0c14cca2cf2c7F3B28c',
      chainId: constants.POLYGON.lzChainId,
      sideGauge: '0x50a42A9d5b7451E19c6D537d420afd3c7096D9BC',
    },
    pool20: {
      // POLYGON vAMM_USDC_agEUR
      gauge: '0xc66CF9DD3086C44223E2764E50D633b58EA5aF80',
      chainId: constants.POLYGON.lzChainId,
      sideGauge: '0xd235AC1923afe8Fa9fe13dd1DCC9929077D9CC47',
    },
    pool21: {
      // POLYGON vAMM_WETH_USDT
      gauge: '0x8ee541925e041c6dff6B1fb1393359C555C270E1',
      chainId: constants.POLYGON.lzChainId,
      sideGauge: '0x5827E67Ad947Ba51E8Af648de63FE386Cc58a0e9',
    },
    pool22: {
      // POLYGON vAMM_WBTC_WETH
      gauge: '0x43869Ccd3ba4DCf6389B541679C233864a7c6aD9',
      chainId: constants.POLYGON.lzChainId,
      sideGauge: '0x614aE992b859efe5ffcEe8f04dcaa0998F326fb2',
    },
    pool23: {
      // POLYGON sAMM_WMATIC_stMATIC
      gauge: '0x60e48c925C93ad01B8f6198CAc3A8d54C662eDeA',
      chainId: constants.POLYGON.lzChainId,
      sideGauge: '0x077491c81319205CA7Cd61ed9751CE91276fFCFf',
    },
    pool24: {
      // foxLP_volatile_deus_wbnb
      gauge: '0x8fd9b79Db670dd12B2B22A161A517dD0abFD5F5C',
    },
    pool25: {
      // ARBITRUM vAMM_DEUS_WETH
      gauge: '0x47bc7670dA52cc1B6e877B8E2ACf28CD113E7F51',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '0x300e0370D952d0118889840A22a8774711a049b8',
    },
    pool26: {
      // POLYGON vAMM_DEUS_WMATIC
      gauge: '0x27dF46E24fBf9dA95e844Ae9e3f09566BED2E06b',
      chainId: constants.POLYGON.lzChainId,
      sideGauge: '0xa3F64FE55fA0084ff4C3aA874a3e13A0a04393f7',
    },
    pool27: {
      // POLYGON vAMM_ACS_WMATIC
      gauge: '0x1103a0b590A15C985a28f28F314d42Fb67c57A51',
      chainId: constants.POLYGON.lzChainId,
      sideGauge: '0x43e70273A9259f835F6630F3FdcECA6996242eEA',
    },
    pool28: {
      // ARBITRUM sAMM_USX_USDC
      gauge: '0x4f5B242925606B7524454771904514477030BDd0',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '0xcF6dA33b33478D9a6350E35D0211926E1f8ACc3d',
    },
    pool29: {
      // ARBITRUM vAMM_TAROT_WETH
      gauge: '0xBa77fCc2676a084478418cB12308Ff980c5bE620',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '0x5f874396e47ea5D9fFe1a3806C8624601Ef1Bf21',
    },
    pool30: {
      // ARBITRUM sAMM_USD+_DAI+
      gauge: '0xe6D007a8a8dFD8bad44e3010E65Aa15437d1D35e',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '0x1291940E15c03b7D20Bb2E71e8D16544681Bf9D9',
    },
    pool31: {
      // foxLP_volatile_TAROT_WBNB
      gauge: '0x7f9B8783B46caA05b6a7162e3D5d3d57Bf60C209',
    },
    pool32: {
      // foxLP_stable_USDT+_USD+
      gauge: '0x5b77295CF63d695778035a6DB510ac1F5Ad5D23B',
    },
    pool33: {
      // POLYGON vAMM_USDC_SPHERE
      gauge: '0x80a0846097D7C16F7eaefaD4Ed5DA2D7Cb762Db3',
      chainId: constants.POLYGON.lzChainId,
      sideGauge: '0xD0F7914C51943F8E17Ddc9d7634a42e26564efaD',
    },
    pool34: {
      // foxLP_vAMM_WBNB_RDNT
      gauge: '0x31c43641e53a7548247DC1e478885F2Dc19D4750',
    },
    pool35: {
      // foxLP_vAMM_ETH_BUSD
      gauge: '0xbEA5341E49f9E72cF844FBe2C607D761DB1138Cd',
    },
    pool36: {
      // foxLP_vAMM_ETH_BTCB
      gauge: '0x9Bd149e96661363480A78933A40E4EB23FD8C990',
    },
    pool37: {
      // ARBITRUM vAMM_RDNT_WETH
      gauge: '0xbc435664d270Ef87f6A8B46806D011D72447023B',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '0x391Dd9dF11bE24b1aa0D9D8f4f8CED8cC76D8aBb',
    },
    pool38: {
      // POLYGON vAMM_WMATIC_PolyDoge
      gauge: '0xdf5123dc3AF884f8fBB5e18C0393899DA9b78398',
      chainId: constants.POLYGON.lzChainId,
      sideGauge: '0x7cCa779B25CfADBDB3e26324b05697a96a5E2eF7',
    },
    pool39: {
      // foxLP_vAMM_WBNB_CHAM
      gauge: '0xd6623315bFC6484C4aa78d083A23959DD96DB7c3',
    },
    pool40: {
      // foxLP_vAMM_ACS_acsFOX
      gauge: '0xed8bd3398d1f6B251Fc3bE3932299f2896bF0119',
    },
  },

  /**
   * BSC - BLUECHIP pools
   */
  BSC_BLUECHIP: {
    pool0: {
      // foxLP_volatile_usdt_wbnb
      gauge: '0x97c93d2144521C6b834f5021b3E93e5c56B86Bc1',
      allocPts: 150,
    },
    pool1: {
      // foxLP_stable_usdt_usdc
      gauge: '0x53B3cAC5D3A63b85B04b726810255a15Eeb60a44',
      allocPts: 150,
    },
    pool2: {
      // ARBITRUM vAMM_WETH_USDC
      gauge: '0xff233980047a44D5bA0DCcDaE33FEBe6Aca523B1',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '0xa9Ed92b6Bf0B6232D6F98fA120177A89550FC8D3',
      allocPts: 30,
    },
    pool3: {
      // ARBITRUM sAMM_USDT_USDC
      gauge: '0x6Ae02ff4aE055E71D1c6343FC60cE611eFcAA53E',
      chainId: constants.ARBITRUM.lzChainId,
      sideGauge: '0x52817053E8f5Dd6dc00672112cf1897c92835ef2',
      allocPts: 30,
    },
    pool4: {
      // POLYGON vAMM_WMATIC_USDC
      gauge: '0xb2b862403D587aDafD2DD98fB6202388A0bCef06',
      chainId: constants.POLYGON.lzChainId,
      sideGauge: '0x63b8A1BccF0dC58c61e9A77A13e96ce9E0484e36',
      allocPts: 20,
    },
    pool5: {
      // POLYGON sAMM_USDC_USDT
      gauge: '0x98F590D08412f374AAFfd4F0F35870397F59108c',
      chainId: constants.POLYGON.lzChainId,
      sideGauge: '0xeEb86A2773EadC03380D3682508eae75F4bc5366',
      allocPts: 20,
    },
    pool6: {
      // foxLP_volatile_fox_wbnb
      gauge: '0x61875aB2586E72988d363Ff722544e7aBf6aE1B5',
      allocPts: 600,
    },
    pool7: {
      // foxLP_volatile_shroom_wbnb
      gauge: '0xC306Ed83E13df7B42F797F50Da11C804d147BdeE',
      allocPts: 0,
    },
  },
};
