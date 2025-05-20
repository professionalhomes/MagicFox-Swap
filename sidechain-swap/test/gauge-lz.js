const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Gauge", function() {
  let provider, VE, ART, TOKEN, ROUTER, GAUGE_F, BRIBE_F, VOTER, PAIR_F, LZ_RECEIVER, owner, investor1, investor2, lzEndpoint;
  let mainGauge0, mainGauge1, mainGauge2; // main chain gauges
  const ONE_WEEK = 24 * 3600 * 7;
  let testTokens;

  before(async () => {
    await hre.network.provider.send("hardhat_reset");
  });

  beforeEach(async () => {
    testTokens = [];

    // Set next sunday
    let dayOfWeek = new Date(await time.latest() * 1000).getDay();
    await time.increase(60 * 60 * 24 * (7 - dayOfWeek)); 

    [ owner, investor1, investor2, lzEndpoint, mainGauge0, mainGauge1, mainGauge2 ] = await ethers.getSigners();

    provider = ethers.getDefaultProvider();

    const PAIRFContract = await ethers.getContractFactory("PairFactory");
    PAIR_F = await PAIRFContract.deploy();
    await PAIR_F.deployed();

    const TOKENContract = await ethers.getContractFactory("OFT");
    TOKEN = await TOKENContract.deploy(
      'MagicFox', // string memory _name
      'FOX', // string memory _symbol
      lzEndpoint.address, // address _lzEndpoint -- AVAX
    );
    await TOKEN.deployed();

    let tmpToken;
    const DUMMYContract = await ethers.getContractFactory("DummyToken");
    for (let i = 0; i < 3; i++) {
      tmpToken = await DUMMYContract.deploy(investor1.address);
      await tmpToken.deployed();
      testTokens.push(tmpToken);
    }

    testTokens[0].connect(investor1).approve(investor2.address, ethers.constants.MaxUint256);
    testTokens[0].connect(investor1).transfer(investor2.address, ethers.utils.parseUnits('100', 18));
    
    const ArtContract = await ethers.getContractFactory("VeArt");
    ART = await upgrades.deployProxy(ArtContract, []);
    await ART.deployed();

    const VEContract = await ethers.getContractFactory("VotingEscrow");
    VE = await VEContract.deploy(TOKEN.address, ART.address);
    await VE.deployed();

    const BRIBEContract = await ethers.getContractFactory("BribeFactoryV2");
    BRIBE_F = await upgrades.deployProxy(BRIBEContract, [owner.address]);
    await BRIBE_F.deployed();

    const GAUGEContract = await ethers.getContractFactory("GaugeFactoryV2");
    GAUGE_F = await upgrades.deployProxy(GAUGEContract, []);
    await GAUGE_F.deployed();

    const VOTERContract = await ethers.getContractFactory("VoterV2_1");
    VOTER = await upgrades.deployProxy(VOTERContract, [VE.address, PAIR_F.address, GAUGE_F.address, BRIBE_F.address]);
    await VOTER.deployed();

    const LZReceiverContract = await ethers.getContractFactory("LZReceiver");
    LZ_RECEIVER = await LZReceiverContract.deploy(VOTER.address, lzEndpoint.address);
    await LZ_RECEIVER.deployed();

    await BRIBE_F.setVoter(VOTER.address);

    await VE.setVoter(VOTER.address);
    
    // create veNFT lock
    // await TOKEN.connect(investor1).approve(VE.address, ethers.constants.MaxUint256);
    // await TOKEN.connect(investor2).approve(VE.address, ethers.constants.MaxUint256);
    // //await VE.connect(investor1).create_lock(ethers.utils.parseUnits('100.00', 18), 3600 * 24 * 14); // 14 days
    // await VE.connect(investor1).create_lock(ethers.utils.parseUnits('1.00', 18), 2 * 365 * 86400); // 2 years
    // await VE.connect(investor1).create_lock(ethers.utils.parseUnits('1.00', 18), 2 * 365 * 86400); // 2 years
    // await VE.connect(investor2).create_lock(ethers.utils.parseUnits('2.00', 18), 2 * 365 * 86400); // 2 years

    // Router
    // const ROUTERContract = await ethers.getContractFactory("Router");
    // ROUTER = await ROUTERContract.deploy(PAIR_F.address, TOKEN.address);
    // await ROUTER.deployed();

    // for (let i = 0; i < testTokens.length; i++) {
    //   await testTokens[i].connect(investor1).approve(ROUTER.address, ethers.constants.MaxUint256);
    // };
  });

  it("Test LzReceive", async function() {
    await VOTER.connect(owner).createGauge(testTokens[0].address, mainGauge0.address);
    await VOTER.connect(owner).createGauge(testTokens[1].address, mainGauge1.address);

    await TOKEN.whitelistVoter(VOTER.address, true);

    // srcAddress needs to be set the same way as in trusted remote
    let srcAddressPayload = hre.ethers.utils.solidityPack(
      ["address", "address"],
      [owner.address, LZ_RECEIVER.address]
    );

    await LZ_RECEIVER.setTrustedRemote(102, srcAddressPayload);

    let timestamp = Math.ceil(new Date().getTime() / 1000);

    const weeklyEmissions = ethers.utils.parseUnits('1000', 18);
    const G_0_Emiss = ethers.utils.parseUnits('500', 18);
    const G_1_Emiss = ethers.utils.parseUnits('300', 18);
    const G_2_Emiss = ethers.utils.parseUnits('200', 18);

    // simulate LZ receive
    let payload = ethers.utils.defaultAbiCoder.encode(
      [ "uint256", "uint256", "address[]", "uint256[]" ], 
      [ timestamp, weeklyEmissions, [mainGauge0.address, mainGauge1.address, mainGauge2.address], [G_0_Emiss, G_1_Emiss, G_2_Emiss]] 
    );
    await LZ_RECEIVER.connect(lzEndpoint).lzReceive(102, srcAddressPayload, 1, payload); // 102 -- bsc LZ internal chainId

    const gauge0_address = await VOTER.gauges(testTokens[0].address);
    const gauge1_address = await VOTER.gauges(testTokens[1].address);

    const gaugeContract = await ethers.getContractFactory("GaugeV2");
    const gauge0 = await gaugeContract.attach(gauge0_address);
    const gauge1 = await gaugeContract.attach(gauge1_address);

    console.log(await TOKEN.balanceOf(VOTER.address));
    console.log(await TOKEN.balanceOf(gauge0_address));
    console.log(await TOKEN.balanceOf(gauge1_address));

    console.log(await VOTER.availableEmissions(timestamp, mainGauge0.address));
    console.log(await VOTER.availableEmissions(timestamp, mainGauge1.address));
    console.log(await VOTER.availableEmissions(timestamp, mainGauge2.address));

    await VOTER.connect(owner).createGauge(testTokens[2].address, mainGauge2.address);
    const gauge2_address = await VOTER.gauges(testTokens[2].address);

    await VOTER.distribute(timestamp, [mainGauge0.address, mainGauge1.address, mainGauge2.address]);

    console.log('VOTER.distribute -- 2nd time');

    console.log(await VOTER.availableEmissions(timestamp, mainGauge0.address));
    console.log(await VOTER.availableEmissions(timestamp, mainGauge1.address));
    console.log(await VOTER.availableEmissions(timestamp, mainGauge2.address));

    console.log(await TOKEN.balanceOf(VOTER.address));
    console.log(await TOKEN.balanceOf(gauge0_address));
    console.log(await TOKEN.balanceOf(gauge1_address));
    console.log(await TOKEN.balanceOf(gauge2_address));

    console.log('lzReceive -- 2nd time');

    timestamp = Math.ceil(new Date().getTime() / 1000) + 3600;

    // Switch to 2step bridging
    await VOTER.flipOneStepProcess();

    // simulate LZ receive
    payload = ethers.utils.defaultAbiCoder.encode(
      [ "uint256", "uint256", "address[]", "uint256[]" ], 
      [ timestamp, weeklyEmissions, [mainGauge0.address, mainGauge1.address, mainGauge2.address], [G_0_Emiss, G_1_Emiss, G_2_Emiss]] 
    );
    await LZ_RECEIVER.connect(lzEndpoint).lzReceive(102, srcAddressPayload, 1, payload); // 102 -- bsc LZ internal chainId
    await VOTER.distribute(timestamp, [mainGauge0.address]);

    console.log('available emissions');
    console.log(await VOTER.availableEmissions(timestamp, mainGauge0.address));
    console.log(await VOTER.availableEmissions(timestamp, mainGauge1.address));
    console.log(await VOTER.availableEmissions(timestamp, mainGauge2.address));

    console.log('balances');
    console.log(await TOKEN.balanceOf(VOTER.address));
    console.log(await TOKEN.balanceOf(gauge0_address));
    console.log(await TOKEN.balanceOf(gauge1_address));
    console.log(await TOKEN.balanceOf(gauge2_address));

    await VOTER.distribute(timestamp, [mainGauge1.address, mainGauge2.address]);

    console.log('available emissions');
    console.log(await VOTER.availableEmissions(timestamp, mainGauge0.address));
    console.log(await VOTER.availableEmissions(timestamp, mainGauge1.address));
    console.log(await VOTER.availableEmissions(timestamp, mainGauge2.address));

    console.log('balances');
    console.log(await TOKEN.balanceOf(VOTER.address));
    console.log(await TOKEN.balanceOf(gauge0_address));
    console.log(await TOKEN.balanceOf(gauge1_address));
    console.log(await TOKEN.balanceOf(gauge2_address));
  });

});
