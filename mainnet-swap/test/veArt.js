const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VeArt", function () {
  let ART;

  before(async () => {
    await hre.network.provider.send("hardhat_reset");
  });

  beforeEach(async () => {
    // Contracts
    const ArtContract = await ethers.getContractFactory("VeArtFox");
    ART = await ArtContract.deploy();
    await ART.deployed();
  });

  it("Can lock with bonus", async function () {
    let amountSmall = ethers.utils.parseUnits("10000", 18);
    //let amountVaried = "10678910000000008000";
    let amountVaried = "10600000000000008000";
    const metadata = await ART._tokenURI(
      1,
      amountSmall,
      1685456986,
      amountVaried
    );

    const metaObj = JSON.parse(atob(metadata.split(";base64,")[1]));
    console.log(atob(metaObj.image.split(";base64,")[1]));
  });
});
