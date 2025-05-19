const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe.only("Receiver", function () {
  let owner, tokenOwner, partner, investor, trader;
  let pairFactory, router, WETH, tokenA, tokenB, tokenC;
  let receiver;

  before(async () => {
    await hre.network.provider.send("hardhat_reset");
  });

  beforeEach(async () => {
    [owner, tokenOwner, partner, investor, trader] = await ethers.getSigners();

    // Tokens
    const tokenContract = await ethers.getContractFactory("DummyToken");

    WETH = await tokenContract.deploy(tokenOwner.address);
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

    // Router
    const receiverContract = await ethers.getContractFactory("Receiver");
    receiver = await receiverContract.deploy(router.address);
    await receiver.deployed();

    // Pairs
    await pairFactory.createPair(tokenA.address, tokenB.address, true); // Stable pair
    await pairFactory.createPair(tokenA.address, tokenC.address, false); // Unstable pair

    // Transfer tokens from token owner and approve
    let amount = ethers.utils.parseUnits("10000", 18);
    let tokens = [tokenA, tokenB, tokenC];

    let recipients = [investor];

    for (let i = 0; i < tokens.length; i++) {
      for (j = 0; j < recipients.length; j++) {
        tokens[i].connect(tokenOwner).transfer(recipients[j].address, amount);
        await tokens[i].connect(recipients[j]).approve(router.address, amount);
      }
      tokens[i].connect(tokenOwner).transfer(receiver.address, amount);
    }

    const deadline = 2147483647; // 2**31-1
    await router
      .connect(investor)
      .addLiquidity(
        tokenA.address,
        tokenB.address,
        true,
        amount,
        amount,
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

  it("Can swap token", async function () {
    const routes = [{ from: tokenA.address, to: tokenB.address, stable: true }];
    await receiver.connect(owner).setTokenMapping(tokenA.address, routes);
    console.log(await tokenA.balanceOf(receiver.address));
    console.log(await tokenB.balanceOf(receiver.address));

    await receiver.connect(owner).swapTokens([tokenA.address]);
    console.log(await tokenA.balanceOf(receiver.address));
    console.log(await tokenB.balanceOf(receiver.address));
  });

  it("Can swap native", async function () {
    //
  });
});
