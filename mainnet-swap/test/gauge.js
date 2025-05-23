const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Gauge", function() {
  let provider, VE, ART, TOKEN, PROXY_OFT, ROUTER, GAUGE_F, BRIBE_F, BRIBE_TOKEN;
  let REWARD_DIST, MINTER, VOTER, BLUECHIP_VOTER, PAIR_F, owner, investor1, investor2, lzEndpoint;
  const ONE_WEEK = 24 * 3600 * 7;
  let testTokens = [];

  before(async () => {
    await hre.network.provider.send("hardhat_reset");
  });

  beforeEach(async () => {
    // Set next sunday
    let dayOfWeek = new Date(await time.latest() * 1000).getDay();
    await time.increase(60 * 60 * 24 * (7 - dayOfWeek)); 

    [ owner, investor1, investor2, lzEndpoint, bluechipFeeCollector ] = await ethers.getSigners();

    provider = ethers.getDefaultProvider();

    const PAIRFContract = await ethers.getContractFactory("PairFactory");
    PAIR_F = await PAIRFContract.deploy();
    await PAIR_F.deployed();

    const TOKENContract = await ethers.getContractFactory("Token");
    TOKEN = await TOKENContract.deploy();
    await TOKEN.deployed();
    await TOKEN.initialMint(investor1.address);

    const PROXYOFTContract = await ethers.getContractFactory("ProxyOFT");
    PROXY_OFT = await PROXYOFTContract.deploy(
      lzEndpoint.address, // _lzEndpoint
      TOKEN.address, // _token
    );
    await PROXY_OFT.deployed();

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
    VOTER = await upgrades.deployProxy(VOTERContract, [VE.address, PAIR_F.address, GAUGE_F.address, BRIBE_F.address, PROXY_OFT.address]);
    await VOTER.deployed();

    await BRIBE_F.setVoter(VOTER.address);

    const BLUECHIP_VOTERContract = await ethers.getContractFactory("BluechipVoter");
    BLUECHIP_VOTER = await upgrades.deployProxy(BLUECHIP_VOTERContract, [
      VE.address, 
      PAIR_F.address, 
      GAUGE_F.address, 
      PROXY_OFT.address, 
      bluechipFeeCollector.address
    ]);
    await BLUECHIP_VOTER.deployed();

    const RDContract = await ethers.getContractFactory("RewardsDistributor");
    REWARD_DIST = await RDContract.deploy(VE.address, TOKEN.address);
    await REWARD_DIST.deployed();

    const MINTERContract = await ethers.getContractFactory("Minter");
    MINTER = await upgrades.deployProxy(MINTERContract, [VOTER.address, BLUECHIP_VOTER.address, VE.address, REWARD_DIST.address]);
    await MINTER.deployed();

    await VE.setVoter(VOTER.address);
    await TOKEN.setMinter(MINTER.address);
    await VOTER.setMinter(MINTER.address);
    await BLUECHIP_VOTER.setMinter(MINTER.address);
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

    // Add one gauge to make it work -- prevent division by zero totalWeight
    await BLUECHIP_VOTER.createGauge(testTokens[0].address, 0);
    await BLUECHIP_VOTER.connect(owner).vote(
      [testTokens[0].address],
      [100]
    );
  });

  it("Only governor can add gauge", async function() {
      await VOTER.connect(owner).createGauge(testTokens[0].address, 0);
      await expect(VOTER.connect(investor1).createGauge(testTokens[1].address, 0)).to.be.reverted;

      VOTER.connect(owner).setGovernor(investor1.address);

      await expect(VOTER.connect(owner).createGauge(testTokens[1].address, 0)).to.be.reverted;
      await VOTER.connect(investor1).createGauge(testTokens[1].address, 0);
  });

  // it("Gauges can not be duplicated", async function() {
  //     await VOTER.createGauge(testTokens[0].address, 0);
  //     await VOTER.createGauge(testTokens[1].address, 0);
  //     await expect(VOTER.createGauge(testTokens[0].address, 0)).to.be.reverted;
  //     await expect(VOTER.createGauge(testTokens[1].address, 0)).to.be.reverted;
  // });

  it("Test 3 ePoch flow", async function() {
    // Create pairs
    const pairContract = await ethers.getContractFactory("Pair");

    await PAIR_F.createPair(testTokens[0].address, testTokens[1].address, true); // Stable pair
    await PAIR_F.createPair(testTokens[0].address, testTokens[1].address, false); // Unstable pair

    const stableAddress = await PAIR_F.getPair(testTokens[0].address, testTokens[1].address, true);
    const stablePair = await pairContract.attach(stableAddress);

    const volatileAddress = await PAIR_F.getPair(testTokens[0].address, testTokens[1].address, false);
    const volatilePair = await pairContract.attach(volatileAddress);

    // Create gauges
    const NFT1 = await VE.tokenOfOwnerByIndex(investor1.address, 0);
    const NFT2 = await VE.tokenOfOwnerByIndex(investor2.address, 0);

    await VOTER.createGauge(testTokens[0].address, 0);
    await VOTER.createGauge(testTokens[1].address, 0);
    await VOTER.createGauge(stablePair.address, 0);
    await VOTER.createGauge(volatilePair.address, 0);

    const gauge0_address = await VOTER.gaugeList(0);
    const gauge1_address = await VOTER.gaugeList(1);
    const gauge2_address = await VOTER.gaugeList(2);
    const gauge3_address = await VOTER.gaugeList(3);

    const gaugeContract = await ethers.getContractFactory("GaugeV2");
    const gauge0 = await gaugeContract.attach(gauge0_address);
    const gauge1 = await gaugeContract.attach(gauge1_address);
    const gauge2 = await gaugeContract.attach(gauge2_address);
    const gauge3 = await gaugeContract.attach(gauge3_address);

    const gauge0_bribes = await VOTER.external_bribes(gauge0_address);
    const gauge1_bribes = await VOTER.external_bribes(gauge1_address);
    const gauge2_bribes = await VOTER.external_bribes(gauge2_address);
    const gauge3_bribes = await VOTER.external_bribes(gauge3_address);

    const bribes0_contract = await hre.ethers.getContractAt('Bribe', gauge0_bribes, owner);
    await bribes0_contract.addRewardToken(BRIBE_TOKEN.address);

    // Add liquidity
    const amount = ethers.utils.parseUnits("1000", 18);
    const dl = 2147483647; // 2**31-1
    const args = [true, false];
    for (let i = 0; i < args.length; i++) {
      await ROUTER.connect(investor1).addLiquidity(
        testTokens[0].address, testTokens[1].address, args[i], amount, amount, "0", "0", investor1.address, dl
      );
    }

    await VOTER.connect(investor1).vote(
        NFT1,
        [gauge0_address, gauge1_address, gauge2_address, gauge3_address],
        [100, 100, 100, 100]);
    await VOTER.connect(investor2).vote(NFT2, [gauge1_address, gauge2_address], [1000, 1000]);

    // deposit into gauges
    await testTokens[0].connect(investor1).approve(gauge0.address, ethers.constants.MaxUint256);
    await testTokens[0].connect(investor2).approve(gauge0.address, ethers.constants.MaxUint256);
    await testTokens[1].connect(investor1).approve(gauge1.address, ethers.constants.MaxUint256);
    await stablePair.connect(investor1).approve(gauge2.address, ethers.constants.MaxUint256);
    await volatilePair.connect(investor1).approve(gauge3.address, ethers.constants.MaxUint256);

    // gauges
    await gauge0.connect(investor1).deposit(amount, NFT1); // leave it like this, to check if boosting works
    await gauge0.connect(investor2).depositAll(NFT2);
    await gauge1.connect(investor1).deposit(amount, NFT1);
    await gauge2.connect(investor1).depositAll(NFT1);

    /*
     * Epoch 1 start
     */
    await time.increase(60 * 60 * 24 * 4);
    await VOTER.distributeAll();
    await VOTER.connect(investor1).poke(NFT1);
    await VOTER.connect(investor2).poke(NFT2);

    // Do some trades
    for (let i = 0; i < args.length; i++) {
      await ROUTER.connect(investor1).swapExactTokensForTokens(
        amount.div(10), 0, [{"from": testTokens[0].address, "to": testTokens[1].address, "stable": args[i]}],
        investor1.address, dl
      );
    }

    // deposit bribes
    await BRIBE_TOKEN.approve(bribes0_contract.address, ethers.utils.parseUnits('500', 18));
    await bribes0_contract.notifyRewardAmount(BRIBE_TOKEN.address, ethers.utils.parseUnits('500', 18));
    expect(await BRIBE_TOKEN.balanceOf(investor1.address)).to.equal(0);
    expect(await BRIBE_TOKEN.balanceOf(investor2.address)).to.equal(0);
    expect(await BRIBE_TOKEN.balanceOf(bribes0_contract.address)).to.equal(ethers.utils.parseUnits('500', 18));

    await VOTER.distributeAll();

    /*
     * Epoch 2 start
     */
    await time.increase(60 * 60 * 24 * 7);
    await VOTER.connect(investor1).poke(NFT1);
    await VOTER.connect(investor2).poke(NFT2);

    // Claim LP fees manually
    let start0 = await testTokens[0].balanceOf(investor1.address);
    await stablePair.connect(investor1).claimFees();
    let end0 = await testTokens[0].balanceOf(investor1.address);
    expect(end0 - start0).to.equal(0); // No fees because stable pair LP is deposited

    start0 = await testTokens[0].balanceOf(investor1.address);
    await volatilePair.connect(investor1).claimFees();
    end0 = await testTokens[0].balanceOf(investor1.address);
    expect(end0 - start0).to.be.above(0); // Fees because volatile pair LP is not deposited

    // Claim LP fees via gauge
    const internal_bribe = await gauge2.internal_bribe();
    start0 = await testTokens[0].balanceOf(internal_bribe);
    await gauge3.connect(investor1).claimFees();
    end0 = await testTokens[0].balanceOf(internal_bribe);
    expect(end0 - start0).to.equal(0); // No fees because volatile pair LP is not deposited

    start0 = await testTokens[0].balanceOf(internal_bribe);
    await gauge2.connect(investor1).claimFees();
    end0 = await testTokens[0].balanceOf(internal_bribe);
    expect(end0 - start0).to.be.above(0); // Fees because stable pair LP is deposited

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

    await VOTER.distributeAll();

    /*
     * Epoch 3 start
     */
    await time.increase(60 * 60 * 24 * 7);
    await VOTER.connect(investor1).poke(NFT1);
    await VOTER.connect(investor2).poke(NFT2);

    await gauge0.connect(investor1).getReward();
    await gauge0.connect(investor2).getReward();
    await gauge1.connect(investor1).getReward();

    // Claim internal bribes
    start0 = await testTokens[0].balanceOf(investor1.address);
    await VOTER.connect(investor1).claimFees([internal_bribe], [[testTokens[0].address]], NFT1);
    end0 = await testTokens[0].balanceOf(investor1.address);
    expect(end0 - start0).to.be.above(0);  // LP fees claimed to gauge2 in previous epoch, amounts differ!

    // Claim external bribes
    await VOTER.connect(investor1).claimBribes([gauge0_bribes], [[BRIBE_TOKEN.address]], NFT1);
    await VOTER.connect(investor2).claimBribes([gauge0_bribes], [[BRIBE_TOKEN.address]], NFT2);
    expect(await BRIBE_TOKEN.balanceOf(bribes0_contract.address)).to.be.lt(10); // some fraction leftovers are expected
  });


  it("NFT can not be transferred after voting without resetting", async function() {
    await VOTER.createGauge(testTokens[0].address, 0);
    const gauge0_address = await VOTER.gaugeList(0);
    const gauge0_bribes = await VOTER.external_bribes(gauge0_address);

    const NFT = await VE.tokenOfOwnerByIndex(investor1.address, 0);
    await VOTER.connect(investor1).vote(NFT, [gauge0_address], [1000]);

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

  it("Can claim bribes after one epoch", async function() {
    // Setup
    const token = testTokens[testTokens.length-1];
    const NFT = await VE.tokenOfOwnerByIndex(investor1.address, 0);
    const bribe_amount = ethers.utils.parseUnits("100", 18);

    await VOTER.createGauge(token.address, 0);
    const gaugeContract = await ethers.getContractFactory("GaugeV2");
    const gauge0_address = await VOTER.gaugeList(0);
    const gauge = await gaugeContract.attach(gauge0_address);
    const gauge_bribes = await VOTER.external_bribes(gauge.address);

    const bribes_contract = await hre.ethers.getContractAt('Bribe', gauge_bribes, owner);
    await bribes_contract.addRewardToken(BRIBE_TOKEN.address);
    await BRIBE_TOKEN.approve(bribes_contract.address, bribe_amount.mul(10));
    await token.connect(investor1).approve(gauge.address, ethers.constants.MaxUint256);

    await gauge.connect(investor1).depositAll(NFT);
    await VOTER.connect(investor1).vote(NFT, [gauge0_address], [1000]);

    let new_bribes = await BRIBE_TOKEN.balanceOf(investor1.address);
    let old_bribes, notified_amount;

    for (let epoch = 0; epoch < 10; epoch++) {
      await VOTER.distributeAll();
      await VOTER.connect(investor1).poke(NFT);
      await bribes_contract.notifyRewardAmount(BRIBE_TOKEN.address, bribe_amount);
      await VOTER.connect(investor1).claimBribes([gauge_bribes], [[BRIBE_TOKEN.address]], NFT);

      old_bribes = new_bribes;
      new_bribes = await BRIBE_TOKEN.balanceOf(investor1.address);
      notified_amount = bribe_amount.mul(epoch + 1);

      /*
      console.log("----------[ Epoch " + epoch + " ]----------");
      console.log("Total notified: " + ethers.utils.formatEther(notified_amount));
      console.log("Total received: " + ethers.utils.formatEther(new_bribes));
      console.log("New received:   " + ethers.utils.formatEther(new_bribes.sub(old_bribes)));
      */

      // Tests
      if (epoch == 0) { // Epoch 0 receives bribes immediately
        expect(bribe_amount.sub(new_bribes.sub(old_bribes))).to.be.within(0, 10);
        expect(notified_amount.sub(new_bribes)).to.equal(1);
      } else if (epoch == 1) { // Epoch 1 doesn't receive bribes
        expect(new_bribes.sub(old_bribes)).to.equal(0);
        expect(notified_amount.sub(new_bribes).sub(bribe_amount)).to.be.within(0, 10);
      } else { // Epochs 2 - 9 receive bribes for previous week
        expect(bribe_amount.sub(new_bribes.sub(old_bribes))).to.be.within(0, 10);
        expect(notified_amount.sub(new_bribes).sub(bribe_amount)).to.be.within(0, 10);
      }

      if (epoch == 0) {
          await time.increase(60 * 60 * 24 * 4);
      } else {
          await time.increase(60 * 60 * 24 * 7);
      }
    }
  });
});
