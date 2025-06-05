const hre = require("hardhat");
const fs = require('fs');
var inquirer = require('inquirer');
const proxyAdminABI = require('./abi-proxy-admin');

const addresses = hre.network.config.constants;

/** 
  *  Set below 2 parameters
  */

const PROXY = addresses.bluechipFeeCollector;
const CONTRACT_TO_UPGRADE = 'FeeCollector';

/*********************************************************************************************************/

const timelockerAddress = addresses.timelocker;

const fileName = `.tmp_salts/.tmp_upgrade_${CONTRACT_TO_UPGRADE}_${addresses.lzChainId}.json`;

async function upgradeSchedule (timelocker) {
  // First deploy new implementation
  const ContractF = await hre.ethers.getContractFactory(CONTRACT_TO_UPGRADE);
  const newImplementation = await ContractF.deploy();
  await newImplementation.deployed();
  // const newImplementation = {
  //   address: '0xC34E12175D25B79c958aD32360cF92D8a3Fc0D8f'
  // }

  // console.log("newImplementation deployed to: %saddress/%s", hre.network.config.explorer, newImplementation.address);

  const signer = (await hre.ethers.getSigners())[0];
  const targetContract = new hre.ethers.Contract(addresses.proxyAdmin, proxyAdminABI, signer);

  // const tokenContract = await hre.ethers.getContractAt('MasterChef', farmAddress);
  const timeLockerContract = await hre.ethers.getContractAt('MagicFoxTimelock', timelocker, signer);

  let interfaceStrategy = targetContract.interface;
  let calldata = interfaceStrategy.encodeFunctionData(
    "upgrade", 
    [PROXY, newImplementation.address]
  );
  
  let randomBytes = hre.ethers.utils.randomBytes(32);
  const salt = hre.ethers.utils.hexlify(randomBytes);
  const predecessor = hre.ethers.constants.HashZero; // bytes32(0) - default
  const value = 0;
  const delay = await timeLockerContract.getMinDelay();

  let tmp = {};
  if(fs.existsSync(fileName)) {
    let rawTmp = fs.readFileSync(fileName);
    tmp = JSON.parse(rawTmp);
  }

  tmp.proxy = PROXY;
  tmp.contract = CONTRACT_TO_UPGRADE;
  tmp.newImplementation = newImplementation.address;
  tmp.value = value;
  tmp.calldata = calldata;
  tmp.predecessor = predecessor;
  tmp.salt = salt;
  fs.writeFileSync(fileName, JSON.stringify(tmp));


  console.log('\nCreated: %s', new Date());
  console.log('proxy: %s', PROXY);
  console.log('contract: %s', CONTRACT_TO_UPGRADE);
  console.log('newImplementation: %s', newImplementation.address);
  console.log('Predecessor: %s', predecessor);
  console.log('Salt: %s', salt);

  const answer = await inquirer.prompt([{
    name: "action",
    type: "list",
    message: "Please confirm SCHEDULE of parameter values. Proceed?",
    choices:[
      "No",
      "Yes"
    ]
  }]);

  if (answer.action == "Yes") {
    let transaction = await timeLockerContract.schedule(
      addresses.proxyAdmin,
      value, /* uint256 value, */
      calldata, /* bytes calldata data, */
      predecessor,
      salt,
      delay,
    );
    console.log("Schedule upgrade: %stx/%s", hre.network.config.explorer, transaction.hash);
  } else {
    console.log("Aborting schedule.");
  }
}

async function upgradeExecute (tmp, timelockerAddress) {
  const signer = (await hre.ethers.getSigners())[0]
  const timelocker = await hre.ethers.getContractAt('MagicFoxTimelock', timelockerAddress, signer);

  console.log('proxy: %s', tmp.proxy);
  console.log('contract: %s', tmp.contract);
  console.log('newImplementation: %s', tmp.newImplementation);
  console.log('Salt: %s', tmp.salt);

  let succ = await timelocker.execute(
    addresses.proxyAdmin,
    tmp.value, /* uint256 value, */
    tmp.calldata, /* bytes calldata data, */
    tmp.predecessor,
    tmp.salt
  );
  console.log("Execute Upgrade: %stx/%s", hre.network.config.explorer, succ.hash);
};


async function main() {
  const answer = await inquirer.prompt([{
    name: "action",
    type: "list",
    message: "Choose an action.",
    choices:[
      "Schedule",
      "Execute"
    ]
  }]);

  let tmp;
  if (answer.action == "Execute") {
    tmp = fs.readFileSync(fileName);
    tmp = JSON.parse(tmp);
  }
  
  if (answer.action == "Schedule") {
    await upgradeSchedule(
      timelockerAddress
    );
  } else if (answer.action == "Execute") {
    console.log('Upgrade [Execute]:');
    await upgradeExecute(tmp, timelockerAddress);
  }
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});