const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("veFOX", function() {
  let provider, VE, ART, DMY, owner, investor;
  const ONE_WEEK = 24 * 3600 * 7;

  before(async () => {
    await hre.network.provider.send("hardhat_reset");
  });

  beforeEach(async () => {
    [ owner, investor ] = await ethers.getSigners();

    provider = ethers.getDefaultProvider();

    const DMYContract = await ethers.getContractFactory("DumboToken");
    DMY = await DMYContract.deploy(investor.address);
    await DMY.deployed();

    const ArtContract = await ethers.getContractFactory("VeArt");
    ART = await ArtContract.deploy();
    await ART.deployed();

    const VEContract = await ethers.getContractFactory("VotingEscrow");
    VE = await VEContract.deploy(DMY.address, ART.address);
    await VE.deployed();

    await DMY.connect(investor).approve(VE.address, ethers.constants.MaxUint256);
  });

  
  it("create_lock_for", async function() {
    // NOTE: lock are saved on chain on weekly basis, every Thursday 12:00 UTC 
    await VE.connect(investor).create_lock(ethers.utils.parseUnits('100.00', 18), 3600 * 24 * 2);
    
    const tokenId = await VE.tokenOfOwnerByIndex(investor.address, 0);

    const endTime = await VE.locked__end(tokenId);

    // const totalSupply = await VE.totalSupply();
    // const balanceOfNFT = await VE.balanceOfNFT(tokenId);
    // const tokenURI = await VE.tokenURI(tokenId);

    await expect(VE.connect(investor).withdraw(tokenId)).to.be.revertedWith('The lock didn\'t expire');

    const currentTime = Math.ceil(new Date().getTime() / 1000);
    await hre.ethers.provider.send('evm_increaseTime', [endTime.toNumber() - currentTime]);

    await VE.connect(investor).withdraw(tokenId);

    // await expect(
    //   VE.connect(investor).create_lock(ethers.utils.parseUnits('100.00', 18), 3600 * 24 * 2)
    // ).to.be.revertedWith('Can only lock until time in the future');
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
