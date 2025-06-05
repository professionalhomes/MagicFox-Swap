const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe.only("Launchpad", function () {
  let owner, investor1, investor2, treasury, zap;
  let SALE_TOKEN, TOKEN, PRESALE; // Contracts
  
  const SOFTCAP = ethers.utils.parseUnits("100");
  const HARDCAP = ethers.utils.parseUnits("200");
  const PRICE_PER_TOKEN = ethers.utils.parseUnits("0.5");

  const START_TIME = Math.ceil(new Date().getTime() / 1000) - 10;
  const END_TIME = Math.ceil(new Date().getTime() / 1000) + 3600;

  before(async () => {
    await hre.network.provider.send("hardhat_reset");
  });

  beforeEach(async () => {
    [owner, investor1, investor2, treasury, zap] =
      await ethers.getSigners();

    // Tokens
    const tokenContract = await ethers.getContractFactory("DummyToken");
    
    SALE_TOKEN = await tokenContract.deploy(owner.address);
    TOKEN = await tokenContract.deploy(owner.address);

    await SALE_TOKEN.deployed();
    await TOKEN.deployed();

    // Presale
    const presaleContract = await ethers.getContractFactory("Presale");
    PRESALE = await presaleContract.deploy(
      TOKEN.address, // address _token, 
      SALE_TOKEN.address, // address _saleToken, 
      SOFTCAP, // uint256 _softCap, 
      HARDCAP, // uint256 _hardCap, 
      PRICE_PER_TOKEN, // uint256 _pricePerToken, 
      START_TIME, // uint256 _startTime, 
      END_TIME, // uint256 _endTime,
      treasury.address, // address _treasury
      zap.address, // ZAP
    );
    await PRESALE.deployed();

    // Send some tokens to investors
    await SALE_TOKEN.transfer(investor1.address, ethers.utils.parseUnits("10000"));
    await SALE_TOKEN.transfer(investor2.address, ethers.utils.parseUnits("10000"));

    await SALE_TOKEN.connect(investor1).approve(PRESALE.address, ethers.utils.parseUnits("10000"));
    await SALE_TOKEN.connect(investor2).approve(PRESALE.address, ethers.utils.parseUnits("10000"));
  });

  it("Buy tokens - SOLD OUT", async function () {
    await expect(PRESALE.connect(investor1).buy(PRICE_PER_TOKEN.mul(2))).to.be.revertedWith("Sale not active");

    // Transfer tokens on contract
    await TOKEN.transfer(PRESALE.address, HARDCAP);
    expect(await PRESALE.availableTokens()).to.equal(HARDCAP);

    // Investor 1 buys 2
    await PRESALE.connect(investor1).buy(PRICE_PER_TOKEN.mul(2));
    expect(await PRESALE.availableTokens()).to.equal(ethers.utils.parseUnits("198"));

    // Investor 1 buys 48
    await PRESALE.connect(investor1).buy(PRICE_PER_TOKEN.mul(48));
    expect(await PRESALE.availableTokens()).to.equal(ethers.utils.parseUnits("150"));

    // Investor 2 buys 140
    await PRESALE.connect(investor2).buy(PRICE_PER_TOKEN.mul(140));
    expect(await PRESALE.availableTokens()).to.equal(ethers.utils.parseUnits("10"));

    // Investor 2 buys 10 (trys buying 20)
    await PRESALE.connect(investor2).buy(PRICE_PER_TOKEN.mul(20));
    expect(await PRESALE.availableTokens()).to.equal(ethers.utils.parseUnits("0"));

    // Claim treasury
    await PRESALE.connect(treasury).treasuryClaim();
    await PRESALE.connect(treasury).treasuryClaim();
    await PRESALE.connect(treasury).treasuryClaim();
    expect(await SALE_TOKEN.balanceOf(treasury.address)).to.equal(PRICE_PER_TOKEN.mul(200));
    expect(await TOKEN.balanceOf(treasury.address)).to.equal(0);

    // Investor 1 claims
    await PRESALE.connect(investor1).claim();
    expect(await TOKEN.balanceOf(investor1.address)).to.equal(ethers.utils.parseUnits("50"));

    // Try claiming again
    await expect(PRESALE.connect(investor1).claim()).to.be.revertedWith("already claimed");

    // Try claiming with user that didn't participate
    await expect(PRESALE.connect(treasury).claim()).to.be.revertedWith("nothing to claim");

    // Investor 2 claims
    await PRESALE.connect(investor2).claim();
    expect(await TOKEN.balanceOf(investor2.address)).to.equal(ethers.utils.parseUnits("150"));

    // Try claiming treasury if not treasury wallet
    await expect(PRESALE.connect(investor1).treasuryClaim()).to.be.revertedWith("not treasury");

    // // Claim treasury
    // await PRESALE.connect(treasury).treasuryClaim();
    // expect(await SALE_TOKEN.balanceOf(treasury.address)).to.equal(PRICE_PER_TOKEN.mul(200));
    // expect(await TOKEN.balanceOf(treasury.address)).to.equal(0);
  });

  it("Buy tokens - SOFTCAP not reached", async function () {
    await expect(PRESALE.connect(investor1).buy(PRICE_PER_TOKEN.mul(2))).to.be.revertedWith("Sale not active");

    // Transfer tokens on contract
    await TOKEN.transfer(PRESALE.address, HARDCAP);
    expect(await PRESALE.availableTokens()).to.equal(HARDCAP);

    // Investor 1 buys 50
    await PRESALE.connect(investor1).buy(PRICE_PER_TOKEN.mul(50));
    expect(await PRESALE.availableTokens()).to.equal(ethers.utils.parseUnits("150"));

    // Investor 2 buys 49
    await PRESALE.connect(investor2).buy(PRICE_PER_TOKEN.mul(49));
    expect(await PRESALE.availableTokens()).to.equal(ethers.utils.parseUnits("101"));

    // Try claiming before ending
    await expect(PRESALE.connect(investor1).claim()).to.be.revertedWith("not ended yet");

    // Manually increase time
    await ethers.provider.send('evm_increaseTime', [3600 * 2]);

    // Investor 1 claims - should get back SALE_TOKEN
    const investor1_sale_token_before_claim = await SALE_TOKEN.balanceOf(investor1.address);
    await PRESALE.connect(investor1).claim();
    expect(await TOKEN.balanceOf(investor1.address)).to.equal(ethers.utils.parseUnits("0"));
    expect(await SALE_TOKEN.balanceOf(investor1.address)).to.equal(investor1_sale_token_before_claim.add(PRICE_PER_TOKEN.mul(50)));

    // Investor 2 claims - should get back SALE_TOKEN
    const investor2_sale_token_before_claim = await SALE_TOKEN.balanceOf(investor2.address);
    await PRESALE.connect(investor2).claim();
    expect(await TOKEN.balanceOf(investor2.address)).to.equal(ethers.utils.parseUnits("0"));
    expect(await SALE_TOKEN.balanceOf(investor2.address)).to.equal(investor2_sale_token_before_claim.add(PRICE_PER_TOKEN.mul(49)));

    // Claim treasury
    await PRESALE.connect(treasury).treasuryClaim();
    expect(await SALE_TOKEN.balanceOf(treasury.address)).to.equal(0);
    expect(await TOKEN.balanceOf(treasury.address)).to.equal(HARDCAP);
  });

});
