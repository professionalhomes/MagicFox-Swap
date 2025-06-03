const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe.only("Zap", function () {
  let owner, tokenOwner, investor, user;
  let pairFactory, router, WETH, tokenA, tokenB, tokenC;
  let zap, BCpair;
  let ART, VE_FOX, VE_SHROOM; // Contracts

  before(async () => {
    await hre.network.provider.send("hardhat_reset");
  });

  beforeEach(async () => {
    [owner, tokenOwner, partner, investor, user, distributor] =
      await ethers.getSigners();

    // Tokens
    const tokenContract = await ethers.getContractFactory("DummyToken");
    const wethContract = await ethers.getContractFactory("WETH9");

    WETH = await wethContract.deploy();
    tokenA = await tokenContract.deploy(tokenOwner.address);
    tokenB = await tokenContract.deploy(tokenOwner.address);
    tokenC = await tokenContract.deploy(tokenOwner.address);
    tokenD = await tokenContract.deploy(tokenOwner.address);
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

    const ArtContract = await ethers.getContractFactory("VeArt");
    ART = await ArtContract.deploy();
    await ART.deployed();

    const VeContract = await ethers.getContractFactory("VotingEscrow");
    VE_FOX = await VeContract.deploy(tokenA.address, ART.address);
    await VE_FOX.deployed();

    VE_SHROOM = await VeContract.deploy(tokenB.address, ART.address);
    await VE_SHROOM.deployed();

    // Zap
    const zapContract = await ethers.getContractFactory("MagicZap");
    zap = await zapContract.deploy(
      router.address,
      VE_FOX.address,
      VE_SHROOM.address
    );
    await zap.deployed();

    // Pairs
    await pairFactory.createPair(tokenA.address, tokenB.address, true); // Stable pair
    await pairFactory.createPair(tokenA.address, tokenC.address, false); // Unstable pair
    await pairFactory.createPair(tokenB.address, tokenC.address, true); // Unstable pair
    await pairFactory.createPair(WETH.address, tokenA.address, false); // Unstable pair

    const BCpairAddress = await pairFactory.getPair(
      tokenB.address,
      tokenC.address,
      true
    );
    const pairContract = await ethers.getContractFactory("Pair");
    BCpair = await pairContract.attach(BCpairAddress);

    // Transfer tokens from token owner and approve
    let amountBig = ethers.utils.parseUnits("1000000", 18);
    let amountMedium = ethers.utils.parseUnits("100000", 18);
    let amountSmall = ethers.utils.parseUnits("10000", 18);
    let amountETH = ethers.utils.parseUnits("10", 18);
    let tokens = [tokenA, tokenB, tokenC, tokenD];

    let recipients = [investor, user, distributor];

    for (let i = 0; i < tokens.length; i++) {
      for (j = 0; j < recipients.length; j++) {
        tokens[i]
          .connect(tokenOwner)
          .transfer(recipients[j].address, amountBig);
        await tokens[i]
          .connect(recipients[j])
          .approve(router.address, amountBig);
      }
    }

    await investor.sendTransaction({
      to: WETH.address,
      value: ethers.utils.parseEther("1000"),
    });

    await WETH.connect(investor).approve(router.address, amountBig);

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
        tokenB.address,
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

    // gauge
    // const GAUGEContract = await ethers.getContractFactory("GaugeFactoryV2");
    // GAUGE_F = await upgrades.deployProxy(GAUGEContract, []);
    // await GAUGE_F.deployed();
    // const address = await GAUGE_F.createGaugeV2(
    //   tokenD.address,
    //   "0x0000000000000000000000000000000000000000",
    //   BCpairAddress,
    //   distributor.address,
    //   distributor.address,
    //   distributor.address,
    //   distributor.address,
    //   true
    // );
    // console.log(address);
  });

  it("Can get min amounts", async function () {
    let amountSmall = ethers.utils.parseUnits("10000", 18);
    const routes1 = [
      { from: tokenA.address, to: tokenB.address, stable: true },
    ];
    const routes2 = [
      { from: tokenA.address, to: tokenC.address, stable: true },
    ];
    const { minAmountsSwap, minAmountsLP } = await zap
      .connect(user)
      .getMinAmounts(amountSmall, routes1, routes2, true);
    console.log(minAmountsSwap);
    console.log(minAmountsLP);
  });

  it("Zaps token without staking", async function () {
    let amountSmall = ethers.utils.parseUnits("10000", 18);
    const pair = { from: tokenB.address, to: tokenC.address, stable: true };
    const path0 = [{ from: tokenA.address, to: tokenB.address, stable: true }];
    const path1 = [{ from: tokenA.address, to: tokenC.address, stable: true }];

    const deadline = 2147483647; // 2**31-1
    console.log(await tokenA.balanceOf(user.address));
    console.log(await BCpair.balanceOf(user.address));
    await tokenA.connect(user).approve(zap.address, amountSmall);

    const { minAmountsSwap, minAmountsLP } = await zap
      .connect(user)
      .getMinAmounts(amountSmall, path0, path1, true);

    await zap.connect(user).zap(
      tokenA.address,
      amountSmall,
      pair,
      path0,
      path1,
      [minAmountsSwap[0], minAmountsSwap[1], minAmountsLP[0], minAmountsLP[1]],
      // "0x0000000000000000000000000000000000000000",
      user.address,
      deadline
    );

    console.log(await tokenA.balanceOf(user.address));
    console.log(await BCpair.balanceOf(user.address));
  });

  it("Zaps native without staking", async function () {
    const pair = { from: tokenB.address, to: tokenC.address, stable: true };
    const path0 = [
      { from: WETH.address, to: tokenA.address, stable: true },
      { from: tokenA.address, to: tokenB.address, stable: true },
    ];
    const path1 = [
      { from: WETH.address, to: tokenA.address, stable: true },
      { from: tokenA.address, to: tokenC.address, stable: true },
    ];

    const deadline = 2147483647; // 2**31-1
    console.log(await tokenA.provider.getBalance(user.address));
    console.log(await BCpair.balanceOf(user.address));

    await zap.connect(user).zapNative(
      pair,
      path0,
      path1,
      [0, 0, 0, 0],
      // "0x0000000000000000000000000000000000000000",
      user.address,
      deadline,
      { value: ethers.utils.parseEther("1.0") }
    );

    console.log(await tokenA.provider.getBalance(user.address));
    console.log(await BCpair.balanceOf(user.address));
  });

  it("Zaps fox stake 50/50", async function () {
    let amountSmall = ethers.utils.parseUnits("10000", 18);
    const path0 = [{ from: tokenC.address, to: tokenA.address, stable: true }];
    const path1 = [{ from: tokenC.address, to: tokenB.address, stable: true }];

    const deadline = 2147483647; // 2**31-1
    console.log(await tokenC.balanceOf(user.address));
    console.log(await tokenA.balanceOf(VE_FOX.address));

    await tokenC.connect(user).approve(zap.address, amountSmall);
    await zap.connect(user).zapFoxStake(
      tokenC.address,
      amountSmall,
      50,
      31536000, // 365 days
      path0,
      path1,
      [0, 0],
      user.address,
      deadline
    );

    console.log(await tokenC.balanceOf(user.address));
    console.log(await tokenA.balanceOf(VE_FOX.address));
    console.log(await tokenB.balanceOf(VE_SHROOM.address));

    const NFT_FOX_1 = await VE_FOX.tokenOfOwnerByIndex(user.address, 0);
    const NFT_SHROOM_1 = await VE_SHROOM.tokenOfOwnerByIndex(user.address, 0);

    expect(NFT_FOX_1).to.be.above(0);
    expect(NFT_SHROOM_1).to.be.above(0);
  });

  it("Zaps fox stake 100 / 0", async function () {
    let amountSmall = ethers.utils.parseUnits("10000", 18);
    const path0 = [{ from: tokenC.address, to: tokenA.address, stable: true }];
    const path1 = [{ from: tokenC.address, to: tokenB.address, stable: true }];

    const deadline = 2147483647; // 2**31-1
    console.log(await tokenC.balanceOf(user.address));
    console.log(await tokenA.balanceOf(VE_FOX.address));

    await tokenC.connect(user).approve(zap.address, amountSmall);
    await zap.connect(user).zapFoxStake(
      tokenC.address,
      amountSmall,
      100,
      31536000, // 365 days
      path0,
      path1,
      [0, 0],
      user.address,
      deadline
    );

    console.log(await tokenC.balanceOf(user.address));
    console.log(await tokenA.balanceOf(VE_FOX.address));
    console.log(await tokenB.balanceOf(VE_SHROOM.address));

    const NFT_FOX_1 = await VE_FOX.tokenOfOwnerByIndex(user.address, 0);
    const NFT_SHROOM_1 = await VE_SHROOM.tokenOfOwnerByIndex(user.address, 0);

    expect(NFT_FOX_1).to.be.above(0);
    expect(NFT_SHROOM_1).to.be.equal(0);
  });

  it("Zaps fox stake 0 / 100", async function () {
    let amountSmall = ethers.utils.parseUnits("10000", 18);
    const path0 = [{ from: tokenC.address, to: tokenA.address, stable: true }];
    const path1 = [{ from: tokenC.address, to: tokenB.address, stable: true }];

    const deadline = 2147483647; // 2**31-1
    console.log(await tokenC.balanceOf(user.address));
    console.log(await tokenA.balanceOf(VE_FOX.address));

    await tokenC.connect(user).approve(zap.address, amountSmall);
    await zap.connect(user).zapFoxStake(
      tokenC.address,
      amountSmall,
      0,
      31536000, // 365 days
      path0,
      path1,
      [0, 0],
      user.address,
      deadline
    );

    console.log(await tokenC.balanceOf(user.address));
    console.log(await tokenA.balanceOf(VE_FOX.address));
    console.log(await tokenB.balanceOf(VE_SHROOM.address));

    const NFT_FOX_1 = await VE_FOX.tokenOfOwnerByIndex(user.address, 0);
    const NFT_SHROOM_1 = await VE_SHROOM.tokenOfOwnerByIndex(user.address, 0);

    expect(NFT_FOX_1).to.be.equal(0);
    expect(NFT_SHROOM_1).to.be.above(0);
  });

  it("Zaps fox stake reverts for more then 100%", async function () {
    let amountSmall = ethers.utils.parseUnits("10000", 18);
    const path0 = [{ from: tokenC.address, to: tokenA.address, stable: true }];
    const path1 = [{ from: tokenC.address, to: tokenB.address, stable: true }];

    const deadline = 2147483647; // 2**31-1

    await tokenC.connect(user).approve(zap.address, amountSmall);
    await expect(
      zap.connect(user).zapFoxStake(
        tokenC.address,
        amountSmall,
        101,
        31536000, // 365 days
        path0,
        path1,
        [0, 0],
        user.address,
        deadline
      )
    ).to.be.reverted;
  });

  it("Zaps fox stake NATIVE 50/50", async function () {
    const path0 = [{ from: WETH.address, to: tokenA.address, stable: true }];
    const path1 = [
      { from: WETH.address, to: tokenA.address, stable: true },
      { from: tokenA.address, to: tokenB.address, stable: true },
    ];

    const deadline = 2147483647; // 2**31-1

    console.log(await tokenA.provider.getBalance(user.address));
    await zap.connect(user).zapFoxStakeNative(
      50,
      31536000, // 365 days
      path0,
      path1,
      [0, 0],
      user.address,
      deadline,
      { value: ethers.utils.parseEther("1.0") }
    );

    console.log(await tokenA.provider.getBalance(user.address));
    console.log(await tokenA.balanceOf(VE_FOX.address));
    console.log(await tokenB.balanceOf(VE_SHROOM.address));

    const NFT_FOX_1 = await VE_FOX.tokenOfOwnerByIndex(user.address, 0);
    const NFT_SHROOM_1 = await VE_SHROOM.tokenOfOwnerByIndex(user.address, 0);

    expect(NFT_FOX_1).to.be.above(0);
    expect(NFT_SHROOM_1).to.be.above(0);
  });
});
