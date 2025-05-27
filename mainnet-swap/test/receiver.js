const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Receiver", function () {
  let owner, tokenOwner, investor, deposit;
  let pairFactory, router, WETH, tokenA, tokenB, tokenC;
  let receiver;

  before(async () => {
    await hre.network.provider.send("hardhat_reset");
  });

  beforeEach(async () => {
    [owner, tokenOwner, partner, investor, deposit] = await ethers.getSigners();

    // Tokens
    const tokenContract = await ethers.getContractFactory("DummyToken");
    const wethContract = await ethers.getContractFactory("WETH9");

    WETH = await wethContract.deploy();
    tokenA = await tokenContract.deploy(tokenOwner.address);
    tokenB = await tokenContract.deploy(tokenOwner.address);
    tokenC = await tokenContract.deploy(tokenOwner.address);
    await WETH.deployed();
    await tokenA.deployed();
    await tokenB.deployed();
    await tokenC.deployed();

    // Pair Factory
    const pairFactoryContract = await ethers.getContractFactory("PairFactory");
    pairFactory = await pairFactoryContract.deploy();
    await pairFactory.deployed();

    // Router
    const routerContract = await ethers.getContractFactory("Router");
    router = await routerContract.deploy(pairFactory.address, WETH.address);
    await router.deployed();

    // Receiver
    const receiverContract = await ethers.getContractFactory("Receiver");
    receiver = await receiverContract.deploy(router.address, deposit.address);
    await receiver.deployed();

    // Pairs
    await pairFactory.createPair(tokenA.address, tokenB.address, true); // Stable pair
    await pairFactory.createPair(tokenA.address, tokenC.address, false); // Unstable pair
    await pairFactory.createPair(WETH.address, tokenA.address, false); // Unstable pair

    // Transfer tokens from token owner and approve
    let amountBig = ethers.utils.parseUnits("1000000", 18);
    let amountMedium = ethers.utils.parseUnits("100000", 18);
    let amountSmall = ethers.utils.parseUnits("10000", 18);
    let amountETH = ethers.utils.parseUnits("10", 18);
    let tokens = [tokenA, tokenB, tokenC];

    let recipients = [investor];

    for (let i = 0; i < tokens.length; i++) {
      for (j = 0; j < recipients.length; j++) {
        tokens[i]
          .connect(tokenOwner)
          .transfer(recipients[j].address, amountBig);
        await tokens[i]
          .connect(recipients[j])
          .approve(router.address, amountBig);
      }
      tokens[i].connect(tokenOwner).transfer(receiver.address, amountSmall);
    }

    await investor.sendTransaction({
      to: WETH.address,
      value: ethers.utils.parseEther("1000"),
    });

    await WETH.connect(investor).approve(router.address, amountBig);

    await investor.sendTransaction({
      to: receiver.address,
      value: ethers.utils.parseEther("1.0"),
    });

    const deadline = 2147483647; // 2**31-1
    await router
      .connect(investor)
      .addLiquidity(
        tokenA.address,
        tokenB.address,
        true,
        amountMedium,
        amountMedium,
        "0",
        "0",
        investor.address,
        deadline
      );

    await router
      .connect(investor)
      .addLiquidity(
        tokenA.address,
        tokenC.address,
        true,
        amountMedium,
        amountMedium,
        "0",
        "0",
        investor.address,
        deadline
      );

    await router
      .connect(investor)
      .addLiquidity(
        WETH.address,
        tokenA.address,
        true,
        amountETH,
        amountMedium,
        "0",
        "0",
        investor.address,
        deadline
      );
  });

  it("Can add routes", async function () {
    const routes = [
      { from: tokenC.address, to: tokenA.address, stable: true },
      { from: tokenA.address, to: tokenB.address, stable: true },
    ];
    await receiver.connect(owner).setTokenMapping(tokenC.address, routes);

    const contractRoutes = await receiver.getRoutes(tokenC.address);

    expect(contractRoutes.length).to.equal(routes.length);

    for (let i = 0; i < contractRoutes.length; i++) {
      expect(contractRoutes[i].from).to.equal(routes[i].from);
      expect(contractRoutes[i].to).to.equal(routes[i].to);
      expect(contractRoutes[i].stable).to.equal(routes[i].stable);
    }

    // add update them
    await receiver.connect(owner).setTokenMapping(tokenC.address, routes);
  });

  it("Can set approval", async function () {
    let amountMedium = ethers.utils.parseUnits("100000", 18);
    await receiver
      .connect(owner)
      .approveERC20(tokenC.address, router.address, amountMedium);

    const allowance = await tokenC.allowance(receiver.address, router.address);

    expect(allowance).to.equal(amountMedium);
  });

  it("Can swap token", async function () {
    const routes = [{ from: tokenA.address, to: tokenB.address, stable: true }];
    await receiver.connect(owner).setTokenMapping(tokenA.address, routes);
    const balanceBBefore = await tokenB.balanceOf(receiver.address);

    await receiver.connect(owner).swapTokens([tokenA.address]);

    const balanceAAfter = await tokenA.balanceOf(receiver.address);
    const balanceBAfter = await tokenB.balanceOf(receiver.address);

    expect(balanceAAfter).to.equal(0);
    expect(balanceBAfter > balanceBBefore).to.equal(true);
  });

  it("Can swap multiple tokens", async function () {
    const routes1 = [
      { from: tokenB.address, to: tokenA.address, stable: true },
    ];
    await receiver.connect(owner).setTokenMapping(tokenB.address, routes1);
    const routes2 = [
      { from: tokenC.address, to: tokenA.address, stable: true },
    ];
    await receiver.connect(owner).setTokenMapping(tokenC.address, routes2);
    const balanceABefore = await tokenA.balanceOf(receiver.address);

    await receiver.connect(owner).swapTokens([tokenB.address, tokenC.address]);

    const balanceAAfter = await tokenA.balanceOf(receiver.address);
    const balanceBAfter = await tokenB.balanceOf(receiver.address);
    const balanceCAfter = await tokenC.balanceOf(receiver.address);

    expect(balanceBAfter).to.equal(0);
    expect(balanceCAfter).to.equal(0);
    expect(balanceAAfter > balanceABefore).to.equal(true);
  });

  it("Can swap token with multiple hops", async function () {
    const routes = [
      { from: tokenB.address, to: tokenA.address, stable: true },
      { from: tokenA.address, to: tokenC.address, stable: true },
    ];
    await receiver.connect(owner).setTokenMapping(tokenB.address, routes);
    const balanceCBefore = await tokenC.balanceOf(receiver.address);

    await receiver.connect(owner).swapTokens([tokenB.address]);
    const balanceBAfter = await tokenB.balanceOf(receiver.address);
    const balanceCAfter = await tokenC.balanceOf(receiver.address);

    expect(balanceBAfter).to.equal(0);
    expect(balanceCAfter > balanceCBefore).to.equal(true);
  });

  it("Can swap native", async function () {
    const routes = [{ from: WETH.address, to: tokenA.address, stable: true }];
    await receiver
      .connect(owner)
      .setTokenMapping("0x0000000000000000000000000000000000000000", routes);

    const balanceABefore = await tokenA.balanceOf(receiver.address);
    await receiver
      .connect(owner)
      .swapTokens(["0x0000000000000000000000000000000000000000"]);

    const ethAfter = await tokenA.provider.getBalance(receiver.address);

    const balanceAAfter = await tokenA.balanceOf(receiver.address);

    expect(balanceAAfter > balanceABefore).to.equal(true);
    expect(ethAfter).to.equal(0);
  });

  it("Can withdraw tokens", async function () {
    const balance = await tokenA.balanceOf(receiver.address);
    await receiver.connect(investor).withdraw(tokenA.address);
    const depositBalance = await tokenA.balanceOf(deposit.address);
    const balanceAAfter = await tokenA.balanceOf(receiver.address);
    expect(balance).to.equal(depositBalance);
    expect(balanceAAfter).to.equal(0);
  });

  it("Can withdraw native", async function () {
    const balance = await tokenA.provider.getBalance(receiver.address);
    const depositBalanceBefore = await tokenA.provider.getBalance(
      deposit.address
    );
    await receiver
      .connect(investor)
      .withdraw("0x0000000000000000000000000000000000000000");

    const ethAfter = await tokenA.provider.getBalance(receiver.address);

    const depositBalanceAfter = await tokenA.provider.getBalance(
      deposit.address
    );
    expect(depositBalanceBefore.add(balance)).to.equal(depositBalanceAfter);
    expect(ethAfter).to.equal(0);
  });
});
