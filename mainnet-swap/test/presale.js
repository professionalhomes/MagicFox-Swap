const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Presale", function() {
    const ONE_WEEK = 24 * 3600 * 7;
    let VE_FOX, VE_SHROOM, PRESALE; // Contracts
    let USDC, FOX, SHROOM, FOX_LP, SHROOM_LP; // Tokens
    let owner, investor1, investor2, treasury; // Wallets
    let testTokens = [];

    before(async () => {
        await hre.network.provider.send("hardhat_reset");
    });

    beforeEach(async () => {
        // Set next sunday
        let dayOfWeek = new Date(await time.latest() * 1000).getDay();
        await time.increase(60 * 60 * 24 * (7 - dayOfWeek)); 

        // Wallets
        [ owner, investor1, investor2  ] = await ethers.getSigners();

        // Voting Escrow
        // launchpad -> Presale
    });

    it("Constants are set corectly", async function() {
        // REFERRAL_SHARE = 3%

        // MAX_FOX_TO_DISTRIBUTE = 1,558,822

        // MAX_SHROOM_TO_DISTRIBUTE = 3,116,000.00

        // VE_TOKEN_SHARE = 40%
    });

    it("Start / end time works correctly", async function() {
    });

    it("Buying works correctly", async function() {
        // 50% in FOX - 60/40 ratio FOX/veFOX
        // 50% in SHROOM - 60/40 ratio SHROOM/veSHROOM
        // veFOX/veSHROOM has 1 year lock
    });

    it("Claiming works", async function() {
        // Blocktime greater than endtime
        // LP tokens set and liquidity added for FOX & SHROOM

        // LPs for FOX / SHROOM must exist

        // Only owner can add LPs


        // Get expected claim amounts returns correct values
    });

    it("Treasury gets amount from buys", async function() {
        // All USDC from presale is received by the treasury
        // 
    });

    it("Can refer", async function() {
        // If referral address is set, 3% of received USDC should be allocated to referral address
        // Referers can claim referral fee
    });
});
