const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Gauge", function() {
  let provider, VE, ART, TOKEN, ROUTER, GAUGE_F, BRIBE_F, BRIBE_TOKEN, REWARD_DIST, MINTER, VOTER, PAIR_F, DUMMYContract, owner, investor1, investor2;
  const ONE_WEEK = 24 * 3600 * 7;
  let testTokens = [];

  before(async () => {
    await hre.network.provider.send("hardhat_reset");
  });

  beforeEach(async () => {
    // Set next sunday
    let dayOfWeek = new Date(await time.latest() * 1000).getDay();
    await time.increase(60 * 60 * 24 * (7 - dayOfWeek)); 

    [ owner, investor1, investor2  ] = await ethers.getSigners();

    provider = ethers.getDefaultProvider();

    const PAIRFContract = await ethers.getContractFactory("PairFactory");
    PAIR_F = await PAIRFContract.deploy();
    await PAIR_F.deployed();

    const TOKENContract = await ethers.getContractFactory("Thena");
    TOKEN = await TOKENContract.deploy();
    await TOKEN.deployed();
    await TOKEN.initialMint(investor1.address);

    let tmpToken;
    const DUMMYContract = await ethers.getContractFactory("DummyToken");
    tmpToken = await DUMMYContract.deploy(investor1.address);
    await tmpToken.deployed();
    testTokens.push(tmpToken);
    tmpToken = await DUMMYContract.deploy(investor1.address);
    await tmpToken.deployed();
    testTokens.push(tmpToken);

    testTokens[0].connect(investor1).approve(investor2.address, ethers.constants.MaxUint256);
    testTokens[0].connect(investor1).transfer(investor2.address, ethers.utils.parseUnits('100', 18))
    await TOKEN.connect(investor1).approve(investor2.address, ethers.constants.MaxUint256);
    await TOKEN.connect(investor1).transfer(investor2.address, ethers.utils.parseUnits('100', 18))

    // Bribe token
    const BribeTokenContract = await ethers.getContractFactory("DummyToken");
    BRIBE_TOKEN = await BribeTokenContract.deploy(owner.address);
    await BRIBE_TOKEN.deployed();
    
    const ArtContract = await ethers.getContractFactory("VeArt");
    ART = await ArtContract.deploy();
    await ART.deployed();

    const VEContract = await ethers.getContractFactory("VotingEscrow");
    VE = await VEContract.deploy(TOKEN.address, ART.address);
    await VE.deployed();

    const BRIBEContract = await ethers.getContractFactory("BribeFactoryV2");
    BRIBE_F = await BRIBEContract.deploy(owner.address);
    await BRIBE_F.deployed();

    const GAUGEContract = await ethers.getContractFactory("GaugeFactoryV2");
    GAUGE_F = await GAUGEContract.deploy();
    await GAUGE_F.deployed();

    const VOTERContract = await ethers.getContractFactory("VoterV2_1");
    VOTER = await VOTERContract.deploy(VE.address, PAIR_F.address, GAUGE_F.address, BRIBE_F.address);
    await VOTER.deployed();

    await BRIBE_F.setVoter(VOTER.address);

    const RDContract = await ethers.getContractFactory("RewardsDistributor");
    REWARD_DIST = await RDContract.deploy(VE.address, TOKEN.address);
    await REWARD_DIST.deployed();

    const MINTERContract = await ethers.getContractFactory("Minter");
    MINTER = await MINTERContract.deploy(VOTER.address, VE.address, REWARD_DIST.address);
    await MINTER.deployed();

    await VE.setVoter(VOTER.address);
    await TOKEN.setMinter(MINTER.address);
    await VOTER.setMinter(MINTER.address);
    await REWARD_DIST.setDepositor(MINTER.address);

    await MINTER._initialize([], [], 0);
    
    // create veNFT lock
    await TOKEN.connect(investor1).approve(VE.address, ethers.constants.MaxUint256);
    await TOKEN.connect(investor2).approve(VE.address, ethers.constants.MaxUint256);
    //await VE.connect(investor1).create_lock(ethers.utils.parseUnits('100.00', 18), 3600 * 24 * 14); // 14 days
    await VE.connect(investor1).create_lock(ethers.utils.parseUnits('1.00', 18), 2 * 365 * 86400); // 2 years
    await VE.connect(investor1).create_lock(ethers.utils.parseUnits('1.00', 18), 2 * 365 * 86400); // 2 years
    await VE.connect(investor2).create_lock(ethers.utils.parseUnits('2.00', 18), 2 * 365 * 86400); // 2 years

    // Router
    const ROUTERContract = await ethers.getContractFactory("Router");
    ROUTER = await ROUTERContract.deploy(PAIR_F.address, TOKEN.address);
    await ROUTER.deployed();

    for (let i = 0; i < testTokens.length; i++) {
      await testTokens[i].connect(investor1).approve(ROUTER.address, ethers.constants.MaxUint256);
    };
  });

  it("Only governor can add gauge", async function() {
      await VOTER.connect(owner).createGauge(testTokens[0].address);
      await expect(VOTER.connect(investor1).createGauge(testTokens[1].address)).to.be.reverted;

      VOTER.connect(owner).setGovernor(investor1.address);

      await expect(VOTER.connect(owner).createGauge(testTokens[1].address)).to.be.reverted;
      await VOTER.connect(investor1).createGauge(testTokens[1].address);
  });

  it("Gauges can not be duplicated", async function() {
      await VOTER.createGauge(testTokens[0].address);
      await VOTER.createGauge(testTokens[1].address);
      await expect(VOTER.createGauge(testTokens[0].address)).to.be.reverted;
      await expect(VOTER.createGauge(testTokens[1].address)).to.be.reverted;
  });

  it("Test 3 ePoch flow", async function() {

    // Create gauges
    const NFT1 = await VE.tokenOfOwnerByIndex(investor1.address, 0);
    const NFT2 = await VE.tokenOfOwnerByIndex(investor2.address, 0);

    await VOTER.createGauge(testTokens[0].address);
    await VOTER.createGauge(testTokens[1].address);

    const gauge0_address = await VOTER.gauges(testTokens[0].address);
    const gauge1_address = await VOTER.gauges(testTokens[1].address);

    const gaugeContract = await ethers.getContractFactory("GaugeV2");
    const gauge0 = await gaugeContract.attach(gauge0_address);
    const gauge1 = await gaugeContract.attach(gauge1_address);

    const gauge0_bribes = await VOTER.external_bribes(gauge0_address);
    const gauge1_bribes = await VOTER.external_bribes(gauge1_address);

    const bribes0_contract = await hre.ethers.getContractAt('Bribe', gauge0_bribes, owner);
    await bribes0_contract.addRewardToken(BRIBE_TOKEN.address);

    await VOTER.connect(investor1).vote(NFT1, [testTokens[0].address, testTokens[1].address], [1000, 100]);
    await VOTER.connect(investor2).vote(NFT2, [testTokens[1].address], [1000]);

    // deposit into gauges
    await testTokens[0].connect(investor1).approve(gauge0.address, ethers.constants.MaxUint256);
    await testTokens[0].connect(investor2).approve(gauge0.address, ethers.constants.MaxUint256);
    await testTokens[1].connect(investor1).approve(gauge1.address, ethers.constants.MaxUint256);
    // gauge 0
    await gauge0.connect(investor1).depositAll(0); // leave it like this, to check if boosting works
    await gauge0.connect(investor2).depositAll(NFT2);
    // gauge 1
    await gauge1.connect(investor1).depositAll(NFT1);

    // increase from Sunday to Thursday (4 days)
    await time.increase(60 * 60 * 24 * 4);
    // Distribute ePoch #0 -- END

    // Distribute ePoch #1 -- START
    await VOTER.distributeAll();
    console.log(`gauge0 balance: ${await TOKEN.balanceOf(gauge0_address)}`);
    console.log(`gauge1 balance: ${await TOKEN.balanceOf(gauge1_address)}`);
    console.log(`---------------------------------------------`);

    // set votes
    await VOTER.connect(investor1).poke(NFT1);
    await VOTER.connect(investor2).poke(NFT2);

    // deposit bribes
    await BRIBE_TOKEN.approve(bribes0_contract.address, ethers.utils.parseUnits('500', 18));
    await bribes0_contract.notifyRewardAmount(BRIBE_TOKEN.address, ethers.utils.parseUnits('500', 18));
    expect(await BRIBE_TOKEN.balanceOf(investor1.address)).to.equal(0);
    expect(await BRIBE_TOKEN.balanceOf(investor2.address)).to.equal(0);
    expect(await BRIBE_TOKEN.balanceOf(bribes0_contract.address)).to.equal(ethers.utils.parseUnits('500', 18));

    // increase from Thursday to next Thursday (7 days)
    await time.increase(60 * 60 * 24 * 7);

    // claim emissions GAUGE 0 (FOX)
    const investor1BalanceBefore = await TOKEN.balanceOf(investor1.address);
    const investor2BalanceBefore = await TOKEN.balanceOf(investor2.address);

    const pending1Earned = await gauge0.earned(investor1.address);
    const pending2Earned = await gauge0.earned(investor2.address);

    await gauge0.connect(investor1).getReward();
    await gauge0.connect(investor2).getReward();
    const investor1BalanceAfter = await TOKEN.balanceOf(investor1.address);
    const investor2BalanceAfter = await TOKEN.balanceOf(investor2.address);

    expect(pending1Earned).to.equal(investor1BalanceAfter.sub(investor1BalanceBefore));
    expect(pending2Earned).to.equal(investor2BalanceAfter.sub(investor2BalanceBefore));

    // claim emissions GAUGE 1 (FOX)
    await gauge1.connect(investor1).getReward();
    
    expect(await gauge0.earned(investor1.address)).to.equal(0);
    expect(await gauge0.earned(investor2.address)).to.equal(0);
    expect(await gauge1.earned(investor1.address)).to.equal(0);
    // Distribute ePoch #1 -- END

    // Distribute ePoch #2 -- START
    console.log(`gauge0 balance: ${await TOKEN.balanceOf(gauge0_address)} (LEFTOVER)`);
    console.log(`gauge1 balance: ${await TOKEN.balanceOf(gauge1_address)} (LEFTOVER)`);

    await VOTER.distributeAll();

    console.log(`------------- distributeAll ----------------`);
    console.log(`gauge0 balance: ${await TOKEN.balanceOf(gauge0_address)}`);
    console.log(`gauge1 balance: ${await TOKEN.balanceOf(gauge1_address)}`);

    // increase from Thursday to next Thursday (7 days)
    await time.increase(60 * 60 * 24 * 7);

    await gauge0.connect(investor1).getReward();
    await gauge0.connect(investor2).getReward();
    await gauge1.connect(investor1).getReward();

    console.log(`------------- gauge balance after getReward ----------------`);

    console.log(`gauge0 balance: ${await TOKEN.balanceOf(gauge0_address)} (LEFTOVER)`);
    console.log(`gauge1 balance: ${await TOKEN.balanceOf(gauge1_address)} (LEFTOVER)`);

    // claimBribes
    await VOTER.connect(investor1).claimBribes([gauge0_bribes], [[BRIBE_TOKEN.address]], NFT1);
    await VOTER.connect(investor2).claimBribes([gauge0_bribes], [[BRIBE_TOKEN.address]], NFT2);
    expect(await BRIBE_TOKEN.balanceOf(bribes0_contract.address)).to.be.lt(10); // some fraction leftovers are expected
  });

  // it("Voters can claim fees for LPs", async function() {
  //   // Set day of the week
  //   let dayOfWeek = new Date(await time.latest() * 1000).getDay();
  //   await time.increase(60 * 60 * 24 * (12 - dayOfWeek));

  //   const NFT1 = await VE.tokenOfOwnerByIndex(investor1.address, 0);
  //   const NFT2 = await VE.tokenOfOwnerByIndex(investor2.address, 0);

  //   // Create pairs
  //   const pairContract = await ethers.getContractFactory("Pair");

  //   await PAIR_F.createPair(testTokens[0].address, testTokens[1].address, true); // Stable pair
  //   await PAIR_F.createPair(testTokens[0].address, testTokens[1].address, false); // Unstable pair

  //   const stableAddress = await PAIR_F.getPair(testTokens[0].address, testTokens[1].address, true);
  //   const stablePair = await pairContract.attach(stableAddress);

  //   const volatileAddress = await PAIR_F.getPair(testTokens[0].address, testTokens[1].address, false);
  //   const volatilePair = await pairContract.attach(volatileAddress);

  //   // Create gauges
  //   await VOTER.createGauge(stablePair.address);
  //   await VOTER.createGauge(volatilePair.address);

  //   const gauge0_address = await VOTER.gauges(stablePair.address);
  //   const gauge1_address = await VOTER.gauges(volatilePair.address);

  //   const gaugeContract = await ethers.getContractFactory("GaugeV2");
  //   const gauge0 = await gaugeContract.attach(gauge0_address);
  //   const gauge1 = await gaugeContract.attach(gauge1_address);

  //   await stablePair.connect(investor1).approve(gauge0.address, ethers.constants.MaxUint256);
  //   await volatilePair.connect(investor1).approve(gauge1.address, ethers.constants.MaxUint256);

  //   // Add liquidity
  //   const amount = ethers.utils.parseUnits("10000", 18);
  //   const dl = 2147483647; // 2**31-1
  //   const args = [true, false];

  //   for (let i = 0; i < args.length; i++) {
  //     await ROUTER.connect(investor1).addLiquidity(
  //       testTokens[0].address, testTokens[1].address, args[i], amount, amount, "0", "0", investor1.address, dl
  //     );
  //   }
    
  //   // Deposit only one LP
  //   expect(await stablePair.balanceOf(investor1.address)).to.be.above(0);
  //   expect(await volatilePair.balanceOf(investor1.address)).to.be.above(0);
  //   await gauge0.connect(investor1).depositAll(NFT1);
  //   await gauge1.connect(investor1).depositAll(NFT1);

  //   // Do some trades
  //   for (let i = 0; i < args.length; i++) {
  //     await ROUTER.connect(investor1).swapExactTokensForTokens(
  //       amount.div(10), 0, [{"from": testTokens[0].address, "to": testTokens[1].address, "stable": args[i]}],
  //       investor1.address, dl
  //     );
  //   }

  //   // Start balance
  //   // ...

  //   // Vote & wait
  //   // Investor1: deposit both, vote for stable
  //   // Investor2: deposit none, vote for both
  //   await VOTER.connect(investor1).vote(NFT1, [stablePair.address], [100]);
  //   await VOTER.connect(investor2).vote(NFT2, [stablePair.address, volatilePair.address], [100, 100]);

  //   await time.increase(60 * 60 * 24 * 7);

  //   console.log(`VOTER balance: ${await TOKEN.balanceOf(VOTER.address)}`);
  //   console.log(`gauge0 balance: ${await TOKEN.balanceOf(gauge0_address)}`);
  //   console.log(`gauge1 balance: ${await TOKEN.balanceOf(gauge1_address)}`);
  //   console.log(`---------------------------------------------`);

  //   await VOTER.distributeAll();

  //   console.log(`VOTER balance: ${await TOKEN.balanceOf(VOTER.address)}`);
  //   console.log(`gauge0 balance: ${await TOKEN.balanceOf(gauge0_address)}`);
  //   console.log(`gauge1 balance: ${await TOKEN.balanceOf(gauge1_address)}`);

  //   // Voters can claim fees only for added LPs they voted on
  //   await VOTER.connect(investor1).claimRewards([gauge0.address], [[stablePair.address]]);  // <-- TODO

  //   // End balance
  //   // ...
  // });

  it("NFT can not be transferred after voting without resetting", async function() {
    await VOTER.createGauge(testTokens[0].address);
    const gauge0_address = await VOTER.gauges(testTokens[0].address);
    const gauge0_bribes = await VOTER.external_bribes(gauge0_address);

    const NFT = await VE.tokenOfOwnerByIndex(investor1.address, 0);
    await VOTER.connect(investor1).vote(NFT, [testTokens[0].address], [1000]);

    // Can not transfer after voting
    await expect(VE.connect(investor1).transferFrom(investor1.address, investor2.address, NFT)).to.be.revertedWith("attached");
    await expect(VE.connect(investor2).transferFrom(investor1.address, investor2.address, NFT)).to.be.revertedWith("attached");

    // Reset can only be done if approved
    await VOTER.connect(investor1).reset(NFT);
    await expect(VOTER.connect(investor2).reset(NFT)).to.be.reverted;

    // The owner can transer after resetting
    await expect(VE.connect(investor2).transferFrom(investor1.address, investor2.address, NFT)).to.be.reverted;
    await VE.connect(investor1).transferFrom(investor1.address, investor2.address, NFT);
  });
});