const hre = require("hardhat");
const constants = require("../../../constants.js");

async function main() {
    const addresses = hre.network.config.constants;
    const deployer = (await hre.ethers.getSigners())[0];

    const ContractF = await hre.ethers.getContractFactory("LZReceiver");
    const receiver_voter = await ContractF.deploy(
        addresses.voter, // voter
        addresses.lzEndpoint, // address _lzEndpoint
    );

    await receiver_voter.deployed();

    console.log("LZReceiver (voter) deployed to: %saddress/%s", hre.network.config.explorer, receiver_voter.address);

    const receiver_bluechip = await ContractF.deploy(
        addresses.bluechipVoter, // bluechip voter
        addresses.lzEndpoint, // address _lzEndpoint
    );

    await receiver_bluechip.deployed();

    console.log("LZReceiver (bluechipVoter) deployed to: %saddress/%s", hre.network.config.explorer, receiver_bluechip.address);

    const VOTER = await hre.ethers.getContractAt('VoterV2_1', addresses.voter, deployer);
    const BLUECHIP_VOTER = await hre.ethers.getContractAt('BluechipVoter', addresses.bluechipVoter, deployer);
    
    // const receiver_voter = await hre.ethers.getContractAt('LZReceiver', addresses.lzReceiver, deployer);
    // const receiver_bluechip = await hre.ethers.getContractAt('LZReceiver', addresses.lzReceiverBluechip, deployer);

    let tx;

    tx = await VOTER.setLzReceiver(receiver_voter.address);
    await tx.wait();
    console.log("VOTER.setLzReceiver");

    tx = await BLUECHIP_VOTER.setLzReceiver(receiver_bluechip.address);
    await tx.wait();
    console.log("BLUECHIP_VOTER.setLzReceiver");

    tx = await receiver_voter.setTrustedRemoteAddress(constants.BSC.lzChainId, constants.BSC.voter);
    await tx.wait();
    console.log("receiver_voter.setTrustedRemoteAddress");

    tx = await receiver_bluechip.setTrustedRemoteAddress(constants.BSC.lzChainId, constants.BSC.bluechipVoter);
    await tx.wait();
    console.log("receiver_bluechip.setTrustedRemoteAddress");
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
