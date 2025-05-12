require("@nomiclabs/hardhat-waffle");
require('hardhat-abi-exporter');
require('hardhat-contract-sizer');
require('@nomiclabs/hardhat-ethers');
require("@nomiclabs/hardhat-etherscan");

let secret = require("./secret.json");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  etherscan: {
    apiKey: {
       opera: secret.ftmScanAPI,
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
          /*{
            version: "0.8.10",
            settings: { }
          }*/
        ]
      },
    networks: {
        ftmmainnet: {
            // url: "https://rpcapi.fantom.network/",
            // url: "https://rpc.ftm.tools/",
            url: "https://rpc.ankr.com/fantom",
            chainId: 250,
            gasPrice: 100000000000, // 20 gwei
            gas: 1000000000,
            accounts: [secret.privateKeyMainnet],
            explorer: 'https://ftmscan.com/',
        }
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