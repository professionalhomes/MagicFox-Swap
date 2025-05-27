require("@nomiclabs/hardhat-waffle");
require('hardhat-abi-exporter');
require('hardhat-contract-sizer');
require('@nomiclabs/hardhat-ethers');
require("@nomiclabs/hardhat-etherscan");
require('@openzeppelin/hardhat-upgrades');

let secret = require("../secret.json");
const constants = require("../constants.js");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  etherscan: {
    apiKey: {
       polygon: secret.polyScanAPI,
       arbitrumOne: secret.arbScanAPI,
       bsc: secret.bscScanAPI,
     }
  },
    // solidity: "0.6.12",
    // solidity: "0.8.9",
    solidity: {
        compilers: [
          {
            version: "0.8.13",
            settings: {
              optimizer: {
                enabled: true,
                runs: 200,
              },
              outputSelection: {
                "*": {
                  "*": [
                    "evm.bytecode",
                    "evm.deployedBytecode",
                    "devdoc",
                    "userdoc",
                    "metadata",
                    "abi"
                  ]
                }
              }
              //viaIR : true,
            },
          },
          {
            version: "0.8.11",
            settings: {
              optimizer: {
                enabled: true,
                runs: 200,
              },
              outputSelection: {
                "*": {
                  "*": [
                    "evm.bytecode",
                    "evm.deployedBytecode",
                    "devdoc",
                    "userdoc",
                    "metadata",
                    "abi"
                  ]
                }
              }
              //viaIR : true,
            },
          }
        ]
      },
    networks: {
        arbitrum: {
          url: "https://arb1.arbitrum.io/rpc",
          chainId: 42161,
          gasPrice: 1200000000, // 0.5 gwei
          gas: 8000000,
          accounts: [secret.privateKeyMainnet],
          explorer: 'https://arbiscan.io/',
          constants: constants.ARBITRUM
        },
    },
    abiExporter: {
        path: './data/abi',
        clear: true,
        flat: true,
        only: [
            'NATIVEToken', 'TEST', 'NativeFarm', 'TimelockController', 'StrategyV3'
        ],
    },
    // projectAddresses: {

    // },
    database: {
        user: 'postgres',
        host: 'localhost',
        database: 'hegel',
        password: 'root',
        port: 5432,
    }
};