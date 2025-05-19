const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Presale", function() {
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    let ART, VE_FOX, VE_SHROOM, PRESALE; // Contracts
    let USDC, FOX, SHROOM, FOX_LP, SHROOM_LP; // Tokens
    let owner, investor1, investor2, treasury; // Wallets
    let now, start, end; // Presale timing

    before(async () => {
        await hre.network.provider.send("hardhat_reset");
    });

    beforeEach(async () => {
        // Set next sunday
        let dayOfWeek = new Date(await time.latest() * 1000).getDay();
        await time.increase(60 * 60 * 24 * (7 - dayOfWeek)); 

        now = await time.latest();
        start = now + (60 * 60 * 24 * 1); // Presale starts Tomorrow
        end = start + (60 * 60 * 24 * 30); // Presale lasts 30 days

        // Wallets
        [owner, investor1, investor2, treasury] = await ethers.getSigners();

        // Tokens
        const TokenContract = await ethers.getContractFactory("Thena");

        USDC = await TokenContract.deploy();
        await USDC.deployed();
        await USDC.initialMint(owner.address);

        FOX = await TokenContract.deploy();
        await FOX.deployed();
        await FOX.initialMint(owner.address);

        SHROOM = await TokenContract.deploy();
        await SHROOM.deployed();
        await SHROOM.initialMint(owner.address);

        FOX_LP = await TokenContract.deploy();
        await FOX_LP.deployed();
        await FOX_LP.initialMint(owner.address);

        SHROOM_LP = await TokenContract.deploy();
        await SHROOM_LP.deployed();
        await SHROOM_LP.initialMint(owner.address);

        // Contracts
        const ArtContract = await ethers.getContractFactory("VeArt");
        ART = await ArtContract.deploy();
        await ART.deployed();

        const VeContract = await ethers.getContractFactory("VotingEscrow");
        VE_FOX = await VeContract.deploy(FOX.address, ART.address);
        await VE_FOX.deployed();

        VE_SHROOM = await VeContract.deploy(SHROOM.address, ART.address);
        await VE_SHROOM.deployed();

        const PresaleContract = await ethers.getContractFactory("Presale");
        PRESALE = await PresaleContract.deploy(
            FOX.address, VE_FOX.address, SHROOM.address, VE_SHROOM.address,
            USDC.address, start, end, treasury.address);
        await PRESALE.deployed();

        // Approvals
        let tokens = [USDC, FOX, SHROOM];
        let wallets = [owner, investor1, investor2];
        let contracts = [VE_FOX, VE_SHROOM, PRESALE];

        for (let i = 0; i < tokens.length; i++) {
            for (let j = 0; j < wallets.length; j++) {
                for (let k = 0; k < contracts.length; k++) {
                    await tokens[i].connect(wallets[j]).approve(contracts[k].address, ethers.constants.MaxUint256);
                }
            }
        }

        // Transfers
        await USDC.transfer(investor1.address, ethers.utils.parseUnits("10000", 18));
        await USDC.transfer(investor2.address, ethers.utils.parseUnits("10000", 18));
        await FOX.transfer(PRESALE.address, ethers.utils.parseUnits("1558822", 18));
        await SHROOM.transfer(PRESALE.address, ethers.utils.parseUnits("3116000", 18));
    });

    it("Constants are set corectly", async function() {
        expect(await PRESALE.MAX_FOX_TO_DISTRIBUTE()).to.equal(ethers.utils.parseUnits("1558822", 18));
        expect(await PRESALE.MAX_SHROOM_TO_DISTRIBUTE()).to.equal(ethers.utils.parseUnits("3116000", 18));
        expect(await PRESALE.VE_TOKEN_SHARE()).to.equal(40);
        expect(await PRESALE.REFERRAL_SHARE()).to.equal(3);
    });

    it("Start / end time works correctly", async function() {
        const amount = ethers.utils.parseUnits("100", 18);

        // Pre-start
        expect(await PRESALE.hasStarted()).to.equal(false);
        expect(await PRESALE.hasEnded()).to.equal(false);
        await expect(PRESALE.connect(investor1).buy(amount, ZERO_ADDRESS)).to.be.revertedWith(
            "isActive: sale is not active");

        // Sale start
        await time.increase(60 * 60 * 24 * 1);
        expect(await PRESALE.hasStarted()).to.equal(true);
        expect(await PRESALE.hasEnded()).to.equal(false);
        await PRESALE.connect(investor1).buy(amount, ZERO_ADDRESS);

        // Sale midpoint
        await time.increase(60 * 60 * 24 * 15);
        expect(await PRESALE.hasStarted()).to.equal(true);
        expect(await PRESALE.hasEnded()).to.equal(false);
        await PRESALE.connect(investor1).buy(amount, ZERO_ADDRESS);

        // Sale end
        await time.increase(60 * 60 * 24 * 15);
        expect(await PRESALE.hasStarted()).to.equal(true);
        expect(await PRESALE.hasEnded()).to.equal(true);
        await expect(PRESALE.connect(investor1).buy(amount, ZERO_ADDRESS)).to.be.revertedWith(
            "isActive: sale is not active");
    })

    it("Buying and claiming works", async function() {
        await time.increase(60 * 60 * 24 * 1);
        const amount = ethers.utils.parseUnits("100", 18);

        await PRESALE.connect(investor1).buy(amount, ZERO_ADDRESS);
        await PRESALE.connect(investor2).buy(amount.mul(2), ZERO_ADDRESS);

        expect(await FOX.balanceOf(investor1.address)).to.equal(0);
        expect(await FOX.balanceOf(investor2.address)).to.equal(0);
        expect(await SHROOM.balanceOf(investor1.address)).to.equal(0);
        expect(await SHROOM.balanceOf(investor2.address)).to.equal(0);

        await expect(PRESALE.connect(investor1).claim()).to.be.revertedWith("isClaimable: sale has not ended");
        await expect(PRESALE.connect(investor2).claim()).to.be.revertedWith("isClaimable: sale has not ended");

        const expected1 = await PRESALE.getExpectedClaimAmounts(investor1.address);
        const expected2 = await PRESALE.getExpectedClaimAmounts(investor2.address);

        // Wait for the sale to end
        await time.increase(60 * 60 * 24 * 30);

        // Claiming should fail before LPs are set
        await expect(PRESALE.connect(investor1).claim()).to.be.revertedWith("isClaimable: no FOX LP tokens");
        await expect(PRESALE.connect(investor2).claim()).to.be.revertedWith("isClaimable: no FOX LP tokens");

        PRESALE.setLpTokens(FOX_LP.address, SHROOM_LP.address);

        const claim1 = await PRESALE.connect(investor1).claim();
        const claim2 = await PRESALE.connect(investor2).claim();
        /*
        const events = (await claim1.wait())["events"];
        for (let i = 0; i < events.length; i++) {
            if (events[i]["event"] == "Claim") {
                console.log(events[i]);
            }
        }
        */

        await expect(PRESALE.connect(investor1).claim()).to.be.revertedWith("claim: already claimed");
        await expect(PRESALE.connect(investor2).claim()).to.be.revertedWith("claim: already claimed");

        const balanceFox1 = await FOX.balanceOf(investor1.address);
        const balanceFox2 = await FOX.balanceOf(investor2.address);
        const balanceShroom1 = await SHROOM.balanceOf(investor1.address);
        const balanceShroom2 = await SHROOM.balanceOf(investor2.address);

        expect(balanceFox1).to.be.above(0);
        expect(balanceFox2).to.be.above(0);
        expect(balanceShroom1).to.be.above(0);
        expect(balanceShroom2).to.be.above(0);
        expect(balanceFox1).to.equal(expected1.foxAmt);
        expect(balanceFox2).to.equal(expected2.foxAmt);
        expect(balanceShroom1).to.equal(expected1.shroomAmt);
        expect(balanceShroom2).to.equal(expected2.shroomAmt);
        expect(balanceFox1.mul(2)).to.equal(balanceFox2);
        expect(balanceShroom1.mul(2)).to.equal(balanceShroom2);

        const NFT_FOX_1 = await VE_FOX.tokenOfOwnerByIndex(investor1.address, 0);
        const NFT_FOX_2 = await VE_FOX.tokenOfOwnerByIndex(investor2.address, 0);
        const NFT_SHROOM_1 = await VE_SHROOM.tokenOfOwnerByIndex(investor1.address, 0);
        const NFT_SHROOM_2 = await VE_SHROOM.tokenOfOwnerByIndex(investor2.address, 0);

        expect(NFT_FOX_1).to.be.above(0);
        expect(NFT_FOX_2).to.be.above(0);
        expect(NFT_SHROOM_1).to.be.above(0);
        expect(NFT_SHROOM_2).to.be.above(0);

        const balanceVeFox1 = await VE_FOX.balanceOfNFT(NFT_FOX_1);
        const balanceVeFox2 = await VE_FOX.balanceOfNFT(NFT_FOX_2);
        const balanceVeShroom1 = await VE_SHROOM.balanceOfNFT(NFT_SHROOM_1);
        const balanceVeShroom2 = await VE_SHROOM.balanceOfNFT(NFT_SHROOM_2);

        expect(balanceVeFox1).to.be.above(0);
        expect(balanceVeFox2).to.be.above(0);
        expect(balanceVeShroom1).to.be.above(0);
        expect(balanceVeShroom2).to.be.above(0);
        //expect(balanceVeFox1).to.equal(expected1.veFoxAmt);
        //expect(balanceVeFox2).to.equal(expected2.veFoxAmt);
        //expect(balanceVeShroom1).to.equal(expected1.veShroom);
        //expect(balanceVeShroom2).to.equal(expected2.veShroom);
        expect(balanceVeFox1.mul(2)).to.equal(balanceVeFox2);
        expect(balanceVeShroom1.mul(2)).to.equal(balanceVeShroom2);

        // Withdrawals not possible until unlock
        await expect(VE_FOX.connect(investor1).withdraw(NFT_FOX_1)).to.be.revertedWith("The lock didn't expire");
        await expect(VE_SHROOM.connect(investor1).withdraw(NFT_SHROOM_1)).to.be.revertedWith("The lock didn't expire");

        await time.increase(60 * 60 * 24 * 300);

        await expect(VE_FOX.connect(investor2).withdraw(NFT_FOX_2)).to.be.revertedWith("The lock didn't expire");
        await expect(VE_SHROOM.connect(investor2).withdraw(NFT_SHROOM_2)).to.be.revertedWith("The lock didn't expire");

        await time.increase(60 * 60 * 24 * 65);

        // Withdraw
        await VE_FOX.connect(investor1).withdraw(NFT_FOX_1);
        await VE_FOX.connect(investor2).withdraw(NFT_FOX_2);
        await VE_SHROOM.connect(investor1).withdraw(NFT_SHROOM_1);
        await VE_SHROOM.connect(investor2).withdraw(NFT_SHROOM_2);

        const endBalanceFox1 = await FOX.balanceOf(investor1.address);
        const endBalanceFox2 = await FOX.balanceOf(investor2.address);
        const endBalanceShroom1 = await SHROOM.balanceOf(investor1.address);
        const endBalanceShroom2 = await SHROOM.balanceOf(investor2.address);

        // Final amounts should equal to added immediate and locked amounts
        expect(expected1.foxAmt.add(expected1.veFoxAmt)).to.equal(endBalanceFox1);
        expect(expected2.foxAmt.add(expected2.veFoxAmt)).to.equal(endBalanceFox2);
        expect(expected1.shroomAmt.add(expected1.veShroomAmt)).to.equal(endBalanceShroom1);
        expect(expected2.shroomAmt.add(expected2.veShroomAmt)).to.equal(endBalanceShroom2);
    });

    it("Treasury gets amount from buys", async function() {
        await time.increase(60 * 60 * 24 * 1);
        const amount = ethers.utils.parseUnits("100", 18);

        const startInvestor1 = await USDC.balanceOf(investor1.address);
        const startInvestor2 = await USDC.balanceOf(investor2.address);
        const startTreasury = await USDC.balanceOf(treasury.address);

        // All USDC from presale is received by the treasury
        await PRESALE.connect(investor1).buy(amount, ZERO_ADDRESS);
        await PRESALE.connect(investor2).buy(amount.mul(2), ZERO_ADDRESS);

        const endInvestor1 = await USDC.balanceOf(investor1.address);
        const endInvestor2 = await USDC.balanceOf(investor2.address);
        const endTreasury = await USDC.balanceOf(treasury.address);

        expect(startInvestor1.sub(endInvestor1)).to.equal(amount);
        expect(startInvestor2.sub(endInvestor2)).to.equal(amount.mul(2));
        expect(startTreasury).to.equal(0);
        expect(endTreasury).to.equal(amount.mul(3));
    });

    it("Can refer", async function() {
        // If referral address is set, 3% of received USDC should be allocated to referral address
        await time.increase(60 * 60 * 24 * 1);
        const amountPercent = ethers.utils.parseUnits("1", 18);
        const amount = amountPercent.mul(100);
        let startInvestor1, startInvestor2, startTreasury, endInvestor1, endInvestor2, endTreasury;

        // Refer to self scenario - user is not allowed to refer the same address
        startTreasury = await USDC.balanceOf(treasury.address);
        await PRESALE.connect(investor2).buy(amount, investor2.address);
        endTreasury = await USDC.balanceOf(treasury.address);
        expect(endTreasury.sub(startTreasury)).to.equal(amount);

        // Claim should not give any funds
        startInvestor1 = await USDC.balanceOf(investor1.address);
        await PRESALE.connect(investor1).claimRefEarnings();
        endInvestor1 = await USDC.balanceOf(investor1.address);
        expect(endInvestor1.sub(startInvestor1)).to.equal(0);

        // Refer to another address
        startTreasury = await USDC.balanceOf(treasury.address);
        await PRESALE.connect(investor1).buy(amount, investor2.address);
        endTreasury = await USDC.balanceOf(treasury.address);
        expect(endTreasury.sub(startTreasury)).to.equal(amountPercent.mul(97));

        // Claim should give funds only to investor2
        startInvestor1 = await USDC.balanceOf(investor1.address);
        startInvestor2 = await USDC.balanceOf(investor2.address);
        await PRESALE.connect(investor1).claimRefEarnings();
        await PRESALE.connect(investor2).claimRefEarnings();
        endInvestor1 = await USDC.balanceOf(investor1.address);
        endInvestor2 = await USDC.balanceOf(investor2.address);

        expect(endInvestor1.sub(startInvestor1)).to.equal(0);
        expect(endInvestor2.sub(startInvestor2)).to.equal(amountPercent.mul(3));
    });

    it("First referrer counts for all buys", async function() {
        // If referral address is set, 3% of received USDC should be allocated to referral address
        await time.increase(60 * 60 * 24 * 1);
        const amountPercent = ethers.utils.parseUnits("1", 18);
        const amount = amountPercent.mul(100);
        let startInvestor1, startInvestor2, endInvestor1, endInvestor2;

        // Referring an invalid address sticks - investor2 doesn't receive % from any buys
        startInvestor2 = await USDC.balanceOf(investor2.address);
        await PRESALE.connect(investor1).buy(amount, ZERO_ADDRESS);
        await PRESALE.connect(investor1).buy(amount, investor2.address);
        await PRESALE.connect(investor2).claimRefEarnings();
        endInvestor2 = await USDC.balanceOf(investor2.address);
        expect(endInvestor2.sub(startInvestor2)).to.equal(0);

        // Referring a valid address sticks - investor1 receives % from both buys
        startInvestor1 = await USDC.balanceOf(investor1.address);
        await PRESALE.connect(investor2).buy(amount, investor1.address);
        await PRESALE.connect(investor2).buy(amount, investor2.address);
        await PRESALE.connect(investor1).claimRefEarnings();
        endInvestor1 = await USDC.balanceOf(investor1.address);
        expect(endInvestor1.sub(startInvestor1)).to.equal(amountPercent.mul(6));
    });
});
