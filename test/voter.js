const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VoterV2", function() {
  let provider, VE, ART, TOKEN, GAUGE_F, BRIBE_F, BRIBE_TOKEN, REWARD_DIST, MINTER, VOTER, PAIR_F, DUMMYContract, owner, investor, testGauge1, testGauge2;
  const ONE_WEEK = 24 * 3600 * 7;
  let testTokens = []

  before(async () => {
    await hre.network.provider.send("hardhat_reset");
  });

  beforeEach(async () => {
    [ owner, investor, testGauge1, testGauge2 ] = await ethers.getSigners();

    provider = ethers.getDefaultProvider();

    const PAIRFContract = await ethers.getContractFactory("PairFactory");
    PAIR_F = await PAIRFContract.deploy();
    await PAIR_F.deployed();

    const TOKENContract = await ethers.getContractFactory("Thena");
    TOKEN = await TOKENContract.deploy();
    await TOKEN.deployed();
    await TOKEN.initialMint(investor.address);

    let tmpToken;
    const DUMMYContract = await ethers.getContractFactory("DummyToken");
    tmpToken = await DUMMYContract.deploy(investor.address);
    await tmpToken.deployed();
    testTokens.push(tmpToken);
    tmpToken = await DUMMYContract.deploy(investor.address);
    await tmpToken.deployed();
    testTokens.push(tmpToken);

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

    await TOKEN.connect(investor).approve(VE.address, ethers.constants.MaxUint256);

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
    REWARD_DIST = await RDContract.deploy(VE.address);
    await REWARD_DIST.deployed();

    const MINTERContract = await ethers.getContractFactory("Minter");
    MINTER = await MINTERContract.deploy(VOTER.address, VE.address, REWARD_DIST.address);
    await MINTER.deployed();

    await VE.setVoter(VOTER.address);
    await TOKEN.setMinter(MINTER.address);
    await VOTER.setMinter(MINTER.address);
    await REWARD_DIST.setDepositor(MINTER.address);
    await MINTER._initialize([owner.address], [ethers.utils.parseUnits('10000', 18)], ethers.utils.parseUnits('10000', 18));
    
    // create veNFT lock
    await TOKEN.connect(investor).approve(VE.address, ethers.constants.MaxUint256);
    await VE.connect(investor).create_lock(ethers.utils.parseUnits('100.00', 18), 3600 * 24 * 14); // 14 days
  });
  
  it("Create gauge, bribe, vote, distributeAll", async function() {
    // Create gauge
    console.log(`---- createGauge 0 ----`);
    await VOTER.createGauge(testTokens[0].address);
    await expect(VOTER.createGauge(testTokens[0].address)).to.be.revertedWith('exists');
    expect(await VOTER.pools(0)).to.equal(testTokens[0].address);

    console.log(`---- createGauge 1 ----`);
    await VOTER.createGauge(testTokens[1].address);
    expect(await VOTER.pools(1)).to.equal(testTokens[1].address);

    const gauge0_address = await VOTER.gauges(testTokens[0].address);
    const gauge1_address = await VOTER.gauges(testTokens[1].address);

    // Add bribes
    const gauge0_bribes = await VOTER.external_bribes(gauge0_address);
    console.log(`\n---- bribes ----`);
    console.log(`gauge0_bribes: ${gauge0_bribes}`);

    const bribes0_contract = await hre.ethers.getContractAt('Bribe', gauge0_bribes, owner);
    await bribes0_contract.addRewardToken(BRIBE_TOKEN.address);
    await BRIBE_TOKEN.approve(bribes0_contract.address, ethers.utils.parseUnits('500', 18));
    await bribes0_contract.notifyRewardAmount(BRIBE_TOKEN.address, ethers.utils.parseUnits('500', 18));

    // Vote 
    const tokenId = await VE.tokenOfOwnerByIndex(investor.address, 0);

    console.log(`\n---- vote ----`);
    console.log(`gauge0 weight: 1000`);
    console.log(`gauge1 weight: 100`);
    await VOTER.connect(investor).vote(tokenId, [testTokens[0].address, testTokens[1].address], [1000, 100]);

    // await testTokens[0].connect(investor).approve(GAUGE_0.address, ethers.constants.MaxUint256);
    // await GAUGE_0.deposit(ethers.utils.parseUnits('100', 18));

    // const gauge0 = await VOTER.gauges(testTokens[0]);
    // console.log(await VOTER.gauges(testTokens[0]));
    // console.log(await VOTER.gauges(testTokens[1]));

    // const currentTime = Math.ceil(new Date().getTime() / 1000);
    // const active_period = await MINTER.active_period();
    // console.log(currentTime);
    // console.log(active_period.toString());
    // console.log(currentTime - active_period.toNumber());

    // await time.setNextBlockTimestamp(currentTime + 86400);
    console.log(`\n---- manually set timestamp 1 week in advance ----`);
    await ethers.provider.send('evm_increaseTime', [3600 * 24 * 7]);

    console.log(`VOTER balance: ${await TOKEN.balanceOf(VOTER.address)}`);
    console.log(`gauge0 balance: ${await TOKEN.balanceOf(gauge0_address)}`);
    console.log(`gauge1 balance: ${await TOKEN.balanceOf(gauge1_address)}`);
    console.log(`--------------------------------`);
    console.log(`bribe0 balance: ${await BRIBE_TOKEN.balanceOf(gauge0_bribes)}`);

    console.log(`\n---- distributeAll ----`);
    
    await VOTER.distributeAll();

    console.log(`VOTER balance: ${await TOKEN.balanceOf(VOTER.address)}`);
    console.log(`gauge0 balance: ${await TOKEN.balanceOf(gauge0_address)}`);
    console.log(`gauge1 balance: ${await TOKEN.balanceOf(gauge1_address)}`);
    console.log(`--------------------------------`);
    console.log(`bribe0 balance: ${await BRIBE_TOKEN.balanceOf(gauge0_bribes)}`);

    console.log(`\n---- claimBribes ----`);
    console.log(`bribe token: ${BRIBE_TOKEN.address}`);
    await VOTER.connect(investor).claimBribes([gauge0_bribes], [[BRIBE_TOKEN.address]], tokenId);
    console.log(`bribe0 balance: ${await BRIBE_TOKEN.balanceOf(gauge0_bribes)}`);
    console.log(`investor bribe balance: ${await BRIBE_TOKEN.balanceOf(investor.address)}`);
  });
  
  /*
  it("Change royalties", async function() {
    expect(await CC.royaltiesFees()).to.equal(5);

    await expect(CC.connect(account1).setRoyaltiesFees(10)
    ).to.be.revertedWith('Ownable: caller is not the owner');

    await CC.setRoyaltiesFees(10);
    expect(await CC.royaltiesFees()).to.equal(10);
  });*/
});
