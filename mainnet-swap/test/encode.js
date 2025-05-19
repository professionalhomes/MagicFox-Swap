const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("veFOX", function() {
  let provider, VE, ART, DMY, owner, investor;

  before(async () => {
    await hre.network.provider.send("hardhat_reset");
  });

  beforeEach(async () => {
    [ owner, investor ] = await ethers.getSigners();

    const DMYContract = await ethers.getContractFactory("DummyReceiver");
    DMY = await DMYContract.deploy(investor.address);
    await DMY.deployed();
  });

  it("encode", async function() {
    const a = await DMY.testEncode([1,2,3]);
    const b = await DMY.testEncode2();
    const c = await DMY.testEncode3();

    console.log(a);
    console.log('---------------------');
    console.log(b);
    console.log('---------------------');
    console.log(c);
  });

});
