const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Gas", function() {
  let provider, VE, ART, TOKEN, PROXY_OFT, ROUTER, GAUGE_F, BRIBE_F, BRIBE_TOKEN;
  let REWARD_DIST, MINTER, VOTER, BLUECHIP_VOTER, PAIR_F, owner, lzEndpoint;
  const ONE_WEEK = 24 * 3600 * 7;
  let testTokens = [];

  before(async () => {
    await hre.network.provider.send("hardhat_reset");
  });

  beforeEach(async () => {
    // Set next sunday
    let dayOfWeek = new Date(await time.latest() * 1000).getDay();
    await time.increase(60 * 60 * 24 * (7 - dayOfWeek)); 

    [ owner, lzEndpoint, bluechipFeeCollector ] = await ethers.getSigners();

    provider = ethers.getDefaultProvider();

    const PAIRFContract = await ethers.getContractFactory("PairFactory");
    PAIR_F = await PAIRFContract.deploy();
    await PAIR_F.deployed();

    const TOKENContract = await ethers.getContractFactory("Token");
    TOKEN = await TOKENContract.deploy();
    await TOKEN.deployed();
    await TOKEN.initialMint(owner.address);

    const PROXYOFTContract = await ethers.getContractFactory("ProxyOFT");
    PROXY_OFT = await PROXYOFTContract.deploy(
      lzEndpoint.address, // _lzEndpoint
      TOKEN.address, // _token
    );
    await PROXY_OFT.deployed();

    let tmpToken;
    const DUMMYContract = await ethers.getContractFactory("DummyToken");

    for (let i = 0; i < 600; i++) {
      tmpToken = await DUMMYContract.deploy(owner.address);
      await tmpToken.deployed();
      testTokens.push(tmpToken);
    }

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

  });

  it("Can vote for 100 gauges", async function() {
    // Setup
    const n_tokens = testTokens.length;
    let tx, receipt, gas_raw, gas;
    let tokens = [];
    let weights = [];

    for (let i = 0; i < n_tokens; i++) {
      await BLUECHIP_VOTER.createGauge(testTokens[i].address, 0);
    }

    console.log(" Tokens | Gas                  | Gas * price         ");
    console.log(" -------+----------------------+---------------------");

    for (let i = 0; i < n_tokens; i++) {
      tokens.push(testTokens[i].address);
      weights.push(100);

      if (i < 10 || (i < 100 && i % 10 == 9) || i % 100 == 99) {
        tx = await BLUECHIP_VOTER.connect(owner).vote(tokens, weights);
        receipt = await tx.wait()
        gas_raw = receipt.gasUsed;
        gas = gas_raw.mul(receipt.effectiveGasPrice);

        console.log(
          " " + (i+1).toString().padStart(6) +
          " | " + ethers.utils.formatEther(gas_raw).padEnd(20) +
          " | " + ethers.utils.formatEther(gas).padEnd(20)
        );
      }
    }
  });
});
