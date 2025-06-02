const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe.only("Bonus", function () {
  let ART, VE_FOX, VE_SHROOM, BONUS; // Contracts
  let FOX, SHROOM; // Tokens
  let owner, investor1, investor2; // Wallets

  before(async () => {
    await hre.network.provider.send("hardhat_reset");
  });

  beforeEach(async () => {
    // Wallets
    [owner, investor1, investor2] = await ethers.getSigners();

    // Tokens
    const TokenContract = await ethers.getContractFactory("Token");

    FOX = await TokenContract.deploy();
    await FOX.deployed();
    await FOX.initialMint(owner.address);

    SHROOM = await TokenContract.deploy();
    await SHROOM.deployed();
    await SHROOM.initialMint(owner.address);

    // Contracts
    const ArtContract = await ethers.getContractFactory("VeArt");
    ART = await ArtContract.deploy();
    await ART.deployed();

    const VeContract = await ethers.getContractFactory("VotingEscrow");
    VE_FOX = await VeContract.deploy(FOX.address, ART.address);
    await VE_FOX.deployed();

    VE_SHROOM = await VeContract.deploy(SHROOM.address, ART.address);
    await VE_SHROOM.deployed();

    const BonusContract = await ethers.getContractFactory("FairlaunchBonus");
    BONUS = await BonusContract.deploy(
      FOX.address,
      VE_FOX.address,
      SHROOM.address,
      VE_SHROOM.address,
      owner.address
    );
    await BONUS.deployed();

    // Approvals
    let tokens = [FOX, SHROOM];
    let wallets = [owner, investor1, investor2];
    let contracts = [VE_FOX, VE_SHROOM, BONUS];

    for (let i = 0; i < tokens.length; i++) {
      for (let j = 0; j < wallets.length; j++) {
        for (let k = 0; k < contracts.length; k++) {
          await tokens[i]
            .connect(wallets[j])
            .approve(contracts[k].address, ethers.constants.MaxUint256);
        }
      }
    }
  });

  it("Can lock with bonus", async function () {
    let amountMedium = ethers.utils.parseUnits("20000", 18);
    let amountSmall = ethers.utils.parseUnits("10000", 18);
    await FOX.connect(owner).transfer(investor1.address, amountMedium);
    await SHROOM.connect(owner).transfer(investor1.address, amountMedium);

    const foxLock = await VE_FOX.connect(investor1).create_lock(
      amountSmall,
      365 * 86400
    ); // 1 years

    let lockEvents = (await foxLock.wait())["events"];
    let foxTokenId;

    for (let i = 0; i < lockEvents.length; i++) {
      if (lockEvents[i]["event"] == "Deposit") {
        foxTokenId = lockEvents[i]["args"][1];
        break;
      }
    }

    const shroomLock = await VE_SHROOM.connect(investor1).create_lock(
      amountSmall,
      365 * 86400
    ); // 1 years

    lockEvents = (await shroomLock.wait())["events"];
    let shroomTokenId;

    for (let i = 0; i < lockEvents.length; i++) {
      if (lockEvents[i]["event"] == "Deposit") {
        shroomTokenId = lockEvents[i]["args"][1];
        break;
      }
    }

    await BONUS.connect(investor1).lockWithBonus(foxTokenId, shroomTokenId);
    const veFoxLocked = await VE_FOX.locked(foxTokenId);
    const veShroomLocked = await VE_SHROOM.locked(shroomTokenId);

    let locked = ethers.utils.parseUnits("23000", 18);
    expect(veFoxLocked.amount).to.equal(locked);
    expect(veShroomLocked.amount).to.equal(locked);
  });

  it("Can lock with bonus for only one token", async function () {
    let amountMedium = ethers.utils.parseUnits("20000", 18);
    let amountSmall = ethers.utils.parseUnits("10000", 18);
    await FOX.connect(owner).transfer(investor1.address, amountMedium);
    await SHROOM.connect(owner).transfer(investor1.address, amountSmall);

    const foxLock = await VE_FOX.connect(investor1).create_lock(
      amountSmall,
      365 * 86400
    ); // 1 years

    let lockEvents = (await foxLock.wait())["events"];
    let foxTokenId;

    for (let i = 0; i < lockEvents.length; i++) {
      if (lockEvents[i]["event"] == "Deposit") {
        foxTokenId = lockEvents[i]["args"][1];
        break;
      }
    }

    const shroomLock = await VE_SHROOM.connect(investor1).create_lock(
      amountSmall,
      365 * 86400
    ); // 1 years

    lockEvents = (await shroomLock.wait())["events"];
    let shroomTokenId;

    for (let i = 0; i < lockEvents.length; i++) {
      if (lockEvents[i]["event"] == "Deposit") {
        shroomTokenId = lockEvents[i]["args"][1];
        break;
      }
    }

    await BONUS.connect(investor1).lockWithBonus(foxTokenId, shroomTokenId);
    const veFoxLocked = await VE_FOX.locked(foxTokenId);
    const veShroomLocked = await VE_SHROOM.locked(shroomTokenId);

    let locked = ethers.utils.parseUnits("23000", 18);
    expect(veFoxLocked.amount).to.equal(locked);
    expect(veShroomLocked.amount).to.equal(amountSmall);
  });

  it("reverts bonus lock if not enough time", async function () {
    let amountMedium = ethers.utils.parseUnits("20000", 18);
    let amountSmall = ethers.utils.parseUnits("10000", 18);
    await FOX.connect(owner).transfer(investor1.address, amountMedium);
    await SHROOM.connect(owner).transfer(investor1.address, amountMedium);

    const foxLock = await VE_FOX.connect(investor1).create_lock(
      amountSmall,
      363 * 86400
    );

    let lockEvents = (await foxLock.wait())["events"];
    let foxTokenId;

    for (let i = 0; i < lockEvents.length; i++) {
      if (lockEvents[i]["event"] == "Deposit") {
        foxTokenId = lockEvents[i]["args"][1];
        break;
      }
    }

    const shroomLock = await VE_SHROOM.connect(investor1).create_lock(
      amountSmall,
      365 * 86400
    ); // 1 years

    lockEvents = (await shroomLock.wait())["events"];
    let shroomTokenId;

    for (let i = 0; i < lockEvents.length; i++) {
      if (lockEvents[i]["event"] == "Deposit") {
        shroomTokenId = lockEvents[i]["args"][1];
        break;
      }
    }

    await expect(
      BONUS.connect(investor1).lockWithBonus(foxTokenId, shroomTokenId)
    ).to.be.revertedWith("Lock time to low for bonus");
  });

  it("Can update bonus", async function () {
    await BONUS.connect(owner).setBonus(15);
    expect(await BONUS.bonus()).to.equal(15);
  });

  it("Reverts with invalid bonus", async function () {
    await expect(BONUS.connect(owner).setBonus(101)).to.be.revertedWith(
      "bonus can be in range 0 - 100"
    );
  });
});
