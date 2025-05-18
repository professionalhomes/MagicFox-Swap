const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Strategy", function() {
  let provider, VE, ART, TOKEN, GAUGE_F, BRIBE_F, BRIBE_TOKEN, REWARD_DIST, MINTER, VOTER, PAIR_F, DUMMYContract, owner, investor1, investor2;
  const ONE_WEEK = 24 * 3600 * 7;
  const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  let testTokens = []

  before(async () => {
    await hre.network.provider.send("hardhat_reset");

    [ owner, investor1, investor2, investor3  ] = await ethers.getSigners();

    provider = ethers.getDefaultProvider();

    const TOKENContract = await ethers.getContractFactory("Token");
    TOKEN = await TOKENContract.deploy();
    await TOKEN.deployed();
    await TOKEN.initialMint(investor1.address);

    const ArtContract = await ethers.getContractFactory("VeArt");
    ART = await ArtContract.deploy();
    await ART.deployed();
    
    const VEContract = await ethers.getContractFactory("VotingEscrow");
    VE = await VEContract.deploy(TOKEN.address, ART.address);
    await VE.deployed();

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
    testTokens[0].connect(investor1).approve(investor3.address, ethers.constants.MaxUint256);
    testTokens[0].connect(investor1).transfer(investor3.address, ethers.utils.parseUnits('100', 18))
    TOKEN.connect(investor1).approve(investor2.address, ethers.constants.MaxUint256);
    TOKEN.connect(investor1).transfer(investor2.address, ethers.utils.parseUnits('100', 18))

    const GAUGEContract = await ethers.getContractFactory("GaugeFactoryV2");
    GAUGE_F = await GAUGEContract.deploy();
    await GAUGE_F.deployed();
  });

  beforeEach(async () => {
    // [ owner, investor1, investor2  ] = await ethers.getSigners();

    // provider = ethers.getDefaultProvider();

    // const PAIRFContract = await ethers.getContractFactory("PairFactory");
    // PAIR_F = await PAIRFContract.deploy();
    // await PAIR_F.deployed();

    // const TOKENContract = await ethers.getContractFactory("Thena");
    // TOKEN = await TOKENContract.deploy();
    // await TOKEN.deployed();
    // await TOKEN.initialMint(investor1.address);

    // let tmpToken;
    // const DUMMYContract = await ethers.getContractFactory("DummyToken");
    // tmpToken = await DUMMYContract.deploy(investor1.address);
    // await tmpToken.deployed();
    // testTokens.push(tmpToken);
    // tmpToken = await DUMMYContract.deploy(investor1.address);
    // await tmpToken.deployed();
    // testTokens.push(tmpToken);

    // testTokens[0].connect(investor1).approve(investor2.address, ethers.constants.MaxUint256);
    // testTokens[0].connect(investor1).transfer(investor2.address, ethers.utils.parseUnits('100', 18))
    // TOKEN.connect(investor1).approve(investor2.address, ethers.constants.MaxUint256);
    // TOKEN.connect(investor1).transfer(investor2.address, ethers.utils.parseUnits('100', 18))

    // Bribe token
    // const BribeTokenContract = await ethers.getContractFactory("DummyToken");
    // BRIBE_TOKEN = await BribeTokenContract.deploy(owner.address);
    // await BRIBE_TOKEN.deployed();
    
    // const ArtContract = await ethers.getContractFactory("VeArt");
    // ART = await ArtContract.deploy();
    // await ART.deployed();

    // const VEContract = await ethers.getContractFactory("VotingEscrow");
    // VE = await VEContract.deploy(TOKEN.address, ART.address);
    // await VE.deployed();

    //await TOKEN.connect(investor1).approve(VE.address, ethers.constants.MaxUint256);

    // const BRIBEContract = await ethers.getContractFactory("BribeFactoryV2");
    // BRIBE_F = await BRIBEContract.deploy(owner.address);
    // await BRIBE_F.deployed();

    // const GAUGEContract = await ethers.getContractFactory("GaugeFactoryV2");
    // GAUGE_F = await GAUGEContract.deploy();
    // await GAUGE_F.deployed();

    // const VOTERContract = await ethers.getContractFactory("VoterV2_1");
    // VOTER = await VOTERContract.deploy(VE.address, PAIR_F.address, GAUGE_F.address, BRIBE_F.address);
    // await VOTER.deployed();

    // await BRIBE_F.setVoter(VOTER.address);

    // const RDContract = await ethers.getContractFactory("RewardsDistributor");
    // REWARD_DIST = await RDContract.deploy(VE.address, TOKEN.address);
    // await REWARD_DIST.deployed();

    // const MINTERContract = await ethers.getContractFactory("Minter");
    // MINTER = await MINTERContract.deploy(VOTER.address, VE.address, REWARD_DIST.address);
    // await MINTER.deployed();

    // await VE.setVoter(VOTER.address);
    // await TOKEN.setMinter(MINTER.address);
    // await VOTER.setMinter(MINTER.address);
    // await REWARD_DIST.setDepositor(MINTER.address);
    ////await MINTER._initialize([owner.address], [ethers.utils.parseUnits('10000', 18)], ethers.utils.parseUnits('10000', 18));
  });

  let investor1tokensBefore;
  let investor2tokensBefore;
  const inv1firstDepositTokens = '10';
  const inv2firstDepositTokens = '40';
  const simulatedEarnings = '10';
  it("Test init deposit", async function() {
    console.log("--- Test Strategy - native ---");

    const GAUGEContract = await ethers.getContractFactory("GaugeV2");
    GAUGE = await GAUGEContract.deploy(ZERO_ADDRESS, VE.address, testTokens[0].address, ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS,false);
    await GAUGE.deployed();

    const STRATEGYContract = await ethers.getContractFactory("Strategy_Native");
    STRATEGY = await STRATEGYContract.deploy(
      [GAUGE.address,ZERO_ADDRESS,ZERO_ADDRESS,ZERO_ADDRESS,ZERO_ADDRESS],
      [ZERO_ADDRESS,ZERO_ADDRESS, testTokens[0].address,ZERO_ADDRESS,ZERO_ADDRESS,ZERO_ADDRESS,ZERO_ADDRESS],
      true,
      0,
      [],
      [],
      [],
      [],
      [],
      [],
      10000
    );
    await STRATEGY.deployed();
    await GAUGE.initStrategy(STRATEGY.address);
    
    investor1tokensBefore = await testTokens[0].balanceOf(investor1.address);
    investor2tokensBefore = await testTokens[0].balanceOf(investor2.address);
    // console.log(`investor1 balance:              ${await testTokens[0].balanceOf(investor1.address)}`);
    // console.log(`investor2 balance:              ${await testTokens[0].balanceOf(investor2.address)}`);
    
    await testTokens[0].connect(investor1).approve(GAUGE.address, ethers.constants.MaxUint256);
    console.log(`investor1 balance:              ${await testTokens[0].balanceOf(investor1.address)}`);
    console.log(`investor2 balance:              ${await testTokens[0].balanceOf(investor2.address)}`);
    await GAUGE.connect(investor1).deposit(ethers.utils.parseUnits(inv1firstDepositTokens, 18), 0);
    console.log(`GAUGE balance:                  ${(await GAUGE.balance())}`);
    console.log(`STRATEGY balance:               ${(await STRATEGY.balanceOf())}`);
    let investor1shares = await GAUGE.balanceOf(investor1.address);
    console.log(`investor1 ${await GAUGE.symbol()} balance:        ${investor1shares}`);
    expect(investor1shares).to.equal(ethers.utils.parseUnits(inv1firstDepositTokens, 18));
  });

  it("Test second deposit", async function() {
    await testTokens[0].connect(investor2).approve(GAUGE.address, ethers.constants.MaxUint256);
    await GAUGE.connect(investor2).deposit(ethers.utils.parseUnits(inv2firstDepositTokens, 18), 0);
    console.log(`investor2 balance:              ${await testTokens[0].balanceOf(investor2.address)}`);
    console.log(`GAUGE balance:                  ${(await GAUGE.balance())}`);
    console.log(`STRATEGY balance:               ${(await STRATEGY.balanceOf())}`);
    console.log(`investor2 ${await GAUGE.symbol()} balance:        ${(await GAUGE.balanceOf(investor2.address))}`);
    let investor2shares = await GAUGE.balanceOf(investor2.address);
    expect(investor2shares).to.equal(ethers.utils.parseUnits(inv2firstDepositTokens, 18));
  });

  it("Simulate strategy earnings", async function() {
    await testTokens[0].connect(investor3).transfer(STRATEGY.address, ethers.utils.parseUnits(simulatedEarnings, 18))
    console.log(`GAUGE balance:                  ${(await GAUGE.balance())}`);
    console.log(`STRATEGY balance:               ${(await STRATEGY.balanceOf())}`);
    console.log(`investor2 ${await GAUGE.symbol()} balance:        ${(await GAUGE.balanceOf(investor2.address))}`);
  });

  it("Deposit with unequal shares/balance", async function() {
    await GAUGE.connect(investor1).deposit(ethers.utils.parseUnits('10', 18), 0);
    // console.log(`investor1 balance:        ${await testTokens[0].balanceOf(investor1.address)}`);
    console.log(`GAUGE balance:                  ${(await GAUGE.balance())}`);
    console.log(`STRATEGY balance:               ${(await STRATEGY.balanceOf())}`);
  });

  it("Investor 1 withdraw all", async function() {
    investor1shares = await GAUGE.balanceOf(investor1.address);
    console.log(`investor1 ${await GAUGE.symbol()} balance:        ${(investor1shares)}`);
    await GAUGE.connect(investor1).withdrawAll();
    let investor1tokensAfter = await testTokens[0].balanceOf(investor1.address);
    console.log(`GAUGE balance:                  ${(await GAUGE.balance())}`);
    console.log(`STRATEGY balance:               ${(await STRATEGY.balanceOf())}`);
    let profit = ethers.BigNumber.from(investor1tokensAfter).sub(ethers.BigNumber.from(investor1tokensBefore));
    console.log(`investor1 tokens profit:        ${profit}`);
    console.log(`investor1 balance:              ${await testTokens[0].balanceOf(investor1.address)}`);
    let expectedProfit = ethers.utils.parseUnits((inv1firstDepositTokens / (parseInt(inv1firstDepositTokens)+parseInt(inv2firstDepositTokens)) * simulatedEarnings).toString(), 18);
    expect(Number(profit)).lessThanOrEqual(Number(expectedProfit));
    expect(Number(profit)).greaterThan(Number(expectedProfit.mul(999).div(1000)));
    expect(await GAUGE.balanceOf(investor1.address)).to.equal(0);
  });

  it("Investor 2 withdraw all", async function() {
    await GAUGE.connect(investor2).withdrawAll();
    let investor2tokensAfter = await testTokens[0].balanceOf(investor2.address);
    console.log(`GAUGE balance:                  ${(await GAUGE.balance())}`);
    console.log(`STRATEGY balance:               ${(await STRATEGY.balanceOf())}`);
    let profit = ethers.BigNumber.from(investor2tokensAfter).sub(ethers.BigNumber.from(investor2tokensBefore));
    console.log(`investor2 profit:               ${profit}`);
    let expectedProfit = ethers.utils.parseUnits((inv2firstDepositTokens / (parseInt(inv1firstDepositTokens)+parseInt(inv2firstDepositTokens)) * simulatedEarnings).toString(), 18);
    expect(Number(profit)).lessThanOrEqual(Number(expectedProfit));
    expect(Number(profit)).greaterThan(Number(expectedProfit.mul(999).div(1000)));
    expect(await GAUGE.balanceOf(investor2.address)).to.equal(0);
  });

  
  // it("Create gauge, bribe, vote,/*  distributeAll", async function() {
  //   // Create gauge
  //   console.log(`---- createGauge 0 ----`);
  //   await VOTER.createGauge(testTokens[0].address);
  //   await expect(VOTER.createGauge(testTokens[0].address)).to.be.revertedWith('exists');
  //   expect(await VOTER.pools(0)).to.equal(testTokens[0].address);

  //   console.log(`---- createGauge 1 ----`);
  //   await VOTER.createGauge(testTokens[1].address);
  //   expect(await VOTER.pools(1)).to.equal(testTokens[1].address);

  //   const gauge0_address = await VOTER.gauges(testTokens[0].address);
  //   const gauge1_address = await VOTER.gauges(testTokens[1].address);

  //   // Add bribes
  //   const gauge0_bribes = await VOTER.external_bribes(gauge0_address);
  //   console.log(`\n---- bribes ----`);
  //   console.log(`gauge0_bribes: ${gauge0_bribes}`);

  //   const bribes0_contract = await hre.ethers.getContractAt('Bribe', gauge0_bribes, owner);
  //   await bribes0_contract.addRewardToken(BRIBE_TOKEN.address);
  //   await BRIBE_TOKEN.approve(bribes0_contract.address, ethers.utils.parseUnits('500', 18));
  //   await bribes0_contract.notifyRewardAmount(BRIBE_TOKEN.address, ethers.utils.parseUnits('500', 18));

  //   // Vote 
  //   const tokenId = await VE.tokenOfOwnerByIndex(investor1.address, 0);

  //   console.log(`\n---- vote ----`);
  //   console.log(`gauge0 weight: 1000`);
  //   console.log(`gauge1 weight: 100`);
  //   await VOTER.connect(investor1).vote(tokenId, [testTokens[0].address, testTokens[1].address], [1000, 100]);

  //   // await testTokens[0].connect(investor1).approve(GAUGE_0.address, ethers.constants.MaxUint256);
  //   // await GAUGE_0.deposit(ethers.utils.parseUnits('100', 18));

  //   // const gauge0 = await VOTER.gauges(testTokens[0]);
  //   // console.log(await VOTER.gauges(testTokens[0]));
  //   // console.log(await VOTER.gauges(testTokens[1]));

  //   // const currentTime = Math.ceil(new Date().getTime() / 1000);
  //   // const active_period = await MINTER.active_period();
  //   // console.log(currentTime);
  //   // console.log(active_period.toString());
  //   // console.log(currentTime - active_period.toNumber());

  //   // await time.setNextBlockTimestamp(currentTime + 86400);
  //   console.log(`\n---- manually set timestamp 1 week in advance ----`);
  //   await ethers.provider.send('evm_increaseTime', [3600 * 24 * 7]);

  //   console.log(`VOTER balance: ${await TOKEN.balanceOf(VOTER.address)}`);
  //   console.log(`gauge0 balance: ${await TOKEN.balanceOf(gauge0_address)}`);
  //   console.log(`gauge1 balance: ${await TOKEN.balanceOf(gauge1_address)}`);
  //   console.log(`--------------------------------`);
  //   console.log(`bribe0 balance: ${await BRIBE_TOKEN.balanceOf(gauge0_bribes)}`);

  //   console.log(`\n---- distributeAll ----`);
    
  //   await VOTER.distributeAll();

  //   console.log(`VOTER balance: ${await TOKEN.balanceOf(VOTER.address)}`);
  //   console.log(`gauge0 balance: ${await TOKEN.balanceOf(gauge0_address)}`);
  //   console.log(`gauge1 balance: ${await TOKEN.balanceOf(gauge1_address)}`);
  //   console.log(`--------------------------------`);
  //   console.log(`bribe0 balance: ${await BRIBE_TOKEN.balanceOf(gauge0_bribes)}`);

  //   console.log(`\n---- claimBribes ----`);
  //   console.log(`bribe token: ${BRIBE_TOKEN.address}`);
  //   await VOTER.connect(investor1).claimBribes([gauge0_bribes], [[BRIBE_TOKEN.address]], tokenId);
  //   console.log(`bribe0 balance: ${await BRIBE_TOKEN.balanceOf(gauge0_bribes)}`);
  //   console.log(`investor1 bribe balance: ${await BRIBE_TOKEN.balanceOf(investor1.address)}`);
  // });


  // it("Test gauge reward boosting", async function() {
  //   console.log(`owner: ${owner.address}`);
  //   console.log(`investor1: ${investor1.address}`);
  //   console.log(`investor2: ${investor2.address}`);
  //   console.log(`VE address: ${VE.address}`);
  //   console.log(`TOKEN totalSupply: ${await TOKEN.totalSupply()}`);
  //   console.log(`VE totalSupply:    ${await VE.totalSupply()}`);

  //   console.log(`investor1 VE balance: ${await VE.connect(investor1).balanceOf(investor1.address)}`);

  //   // Create gauge
  //   console.log(`\n---- createGauge 0 ----`);
  //   await VOTER.createGauge(testTokens[0].address);
  //   const tokenId0 = await VE.tokenOfOwnerByIndex(investor1.address, 0);

  //   const gauge0_address = await VOTER.gauges(testTokens[0].address);
  //   const gauge1_address = await VOTER.gauges(testTokens[1].address);

  //   const GAUGE_0 = await ethers.getContractAt("GaugeV2", gauge0_address);
  //   console.log(`GAUGE_0 totalSupply: ${await GAUGE_0.totalSupply()}`);
  //   console.log(`testToken0 investor1 balance: ${(await testTokens[0].balanceOf(investor1.address))}`);

  //   console.log(`\n---- deposit 1 ----`);
  //   await testTokens[0].connect(investor1).approve(GAUGE_0.address, ethers.constants.MaxUint256);
  //   await testTokens[0].connect(investor2).approve(GAUGE_0.address, ethers.constants.MaxUint256);
  //   await GAUGE_0.connect(investor1).deposit(ethers.utils.parseUnits('2', 18), "0x0");
  //   await GAUGE_0.connect(investor2).deposit(ethers.utils.parseUnits('2', 18), "0x0");

  //   console.log(`GAUGE_0 totalSupply:          ${await GAUGE_0.totalSupply()}`);
  //   console.log(`GAUGE_0 derivedSupply:        ${await GAUGE_0.derivedSupply()}`);

  //   console.log(`\n---- deposit 2 ----`);
  //   await GAUGE_0.connect(investor1).deposit(ethers.utils.parseUnits('2', 18), tokenId0);

  //   console.log(`GAUGE_0 totalSupply:          ${await GAUGE_0.totalSupply()}`);
  //   console.log(`GAUGE_0 derivedSupply:        ${await GAUGE_0.derivedSupply()}`);

  //   console.log(`GAUGE_0 investor1 balance:    ${(await GAUGE_0.balanceOf(investor1.address))}`);
  //   console.log(`GAUGE_0 investor1 dBalance:   ${(await GAUGE_0.derivedBalance(investor1.address))}`);
  //   console.log(`GAUGE_0 investor2 balance:    ${(await GAUGE_0.balanceOf(investor2.address))}`);
  //   console.log(`GAUGE_0 investor2 dBalance:   ${(await GAUGE_0.derivedBalance(investor2.address))}`);

  //   console.log(`\n---- increase boost ----`);
  //   await VE.connect(investor1).deposit_for(tokenId0, ethers.utils.parseUnits('2', 18));
  //   await GAUGE_0.connect(investor1).updateDerivedBalance();
  //   VE.totalSupply()
  //   console.log(`VE totalSUpply:               ${(await VE.totalSupply())}`);
  //   console.log(`GAUGE_0 investor1 dBalance:   ${(await GAUGE_0.derivedBalance(investor1.address))}`);

  //   console.log(`\n---- transfer VE ----`);
  //   await expect(VE.connect(investor1).transferFrom(investor1.address, investor2.address, tokenId0)).to.be.revertedWith('attached');
  //   await GAUGE_0.connect(investor1).withdrawToken(0, tokenId0);
  //   console.log(`GAUGE_0 investor1 balance:    ${(await GAUGE_0.balanceOf(investor1.address))}`);
  //   console.log(`GAUGE_0 investor1 dBalance:   ${(await GAUGE_0.derivedBalance(investor1.address))}`);
  //   await VE.connect(investor1).transferFrom(investor1.address, investor2.address, tokenId0);
    
  //   console.log(`VE owner:                     ${await VE.ownerOf(tokenId0)}`);

  //   console.log(`\n---- vote ----`);
  //   await VOTER.connect(investor2).vote(tokenId0, [testTokens[0].address, testTokens[1].address], [1000, 100]);
  // });

  /*
  it("Change royalties", async function() {
    expect(await CC.royaltiesFees()).to.equal(5);

    await expect(CC.connect(account1).setRoyaltiesFees(10)
    ).to.be.revertedWith('Ownable: caller is not the owner');

    await CC.setRoyaltiesFees(10);
    expect(await CC.royaltiesFees()).to.equal(10);
  });*/
});
