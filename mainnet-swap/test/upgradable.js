const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("upgradableContracts", function() {
  let owner, investor;

  before(async () => {
    await hre.network.provider.send("hardhat_reset");
  });

  beforeEach(async () => {
    [ owner, investor ] = await ethers.getSigners();
  });

  it("test", async function() {
    const DMY_V1 = await ethers.getContractFactory("DummyUpgradable");
    let dummy = await upgrades.deployProxy(DMY_V1, [666]);
    await dummy.deployed();

    expect(await dummy.greet()).to.equal("Whats up! V1");
    expect(await dummy.maxSupply()).to.equal(100);
    expect(await dummy.counter()).to.equal(0);
    await dummy.increaseCounter();
    expect(await dummy.counter()).to.equal(1);

    const DMY_V2 = await ethers.getContractFactory("DummyUpgradableV2");
    dummy = await upgrades.upgradeProxy(dummy.address, DMY_V2);

    expect(await dummy.greet()).to.equal("Whats up! V2");
    expect(await dummy.maxSupply()).to.equal(90);
    expect(await dummy.counter()).to.equal(1);
  });

});
