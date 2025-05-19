const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Swap", function() {
    let owner, tokenOwner, partner, investor, trader;
    let pairFactory, router, WETH, tokenA, tokenB, tokenC;

    before(async () => {
        await hre.network.provider.send("hardhat_reset");
    });

    beforeEach(async () => {
        [ owner, tokenOwner, partner, investor, trader ] = await ethers.getSigners();

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

        // Pairs
        await pairFactory.createPair(tokenA.address, tokenB.address, true); // Stable pair
        await pairFactory.createPair(tokenA.address, tokenC.address, false);  // Unstable pair

        // Transfer tokens from token owner and approve
        let amount = ethers.utils.parseUnits("10000", 18);
        let tokens = [tokenA, tokenB, tokenC];
        let recipients = [partner, investor, trader];

        for (let i = 0; i < tokens.length; i++) {
            for (j = 0; j < recipients.length; j++) {
                tokens[i].connect(tokenOwner).transfer(recipients[j].address, amount);
                await tokens[i].connect(recipients[j]).approve(router.address, amount);
            };
        };
    });

    it("Allows only fee manager to configure fees", async function() {
        let AsOwner = pairFactory.connect(owner);
        let AsManager = pairFactory.connect(partner);

        const pairAddress = await pairFactory.getPair(tokenA.address, tokenB.address, true);

        // Expect all fee manager functions to fail for unrelated address
        await expect(AsManager.setFeeManager(owner.address)).to.be.reverted;
        await expect(AsManager.acceptFeeManager()).to.be.reverted;
        await expect(AsManager.setOwnerFee(1)).to.be.reverted;
        await expect(AsManager.setOwnerFeeAddress(owner.address)).to.be.reverted;
        await expect(AsManager.setPartner(pairAddress, owner.address, 1)).to.be.reverted;
        await expect(AsManager.setFee(true, 1)).to.be.reverted;
        await expect(AsManager.setDegenFee(1)).to.be.reverted;

        // Set partner as fee manager
        await AsOwner.setFeeManager(partner.address);
        await AsManager.acceptFeeManager();

        // Fee manager can call all fee manager functions
        await AsManager.setFeeManager(investor.address);
        await AsManager.setOwnerFee(1);
        await AsManager.setOwnerFeeAddress(owner.address);
        await AsManager.setPartner(pairAddress, owner.address, 1);
        await AsManager.setFee(true, 1);
        await AsManager.setDegenFee(1);

        // Owner can't call fee manager functions after he is no longer fee manager
        await expect(AsOwner.setFeeManager(owner.address)).to.be.reverted;
        await expect(AsOwner.acceptFeeManager()).to.be.reverted;
        await expect(AsOwner.setOwnerFee(1)).to.be.reverted;
        await expect(AsOwner.setOwnerFeeAddress(owner.address)).to.be.reverted;
        await expect(AsOwner.setPartner(pairAddress, owner.address, 1)).to.be.reverted;
        await expect(AsOwner.setFee(true, 1)).to.be.reverted;
        await expect(AsOwner.setDegenFee(1)).to.be.reverted;
    });

    it("Enforces fee limits", async function() {
        // Owner fee (0-3000)
        await pairFactory.setOwnerFee(0);
        await pairFactory.setOwnerFee(3000);
        await pairFactory.setOwnerFee(1234);
        expect(await pairFactory.ownerFee()).to.equal(1234);

        await expect(pairFactory.setOwnerFee(-1)).to.be.reverted;
        await expect(pairFactory.setOwnerFee(3001)).to.be.reverted;

        // Partner fee (0-5000)
        const pairAddress = await pairFactory.getPair(tokenA.address, tokenB.address, true);

        await pairFactory.setPartner(pairAddress, partner.address, 0);
        await pairFactory.setPartner(pairAddress, partner.address, 5000);
        await pairFactory.setPartner(pairAddress, partner.address, 1234);

        let partnerData = await pairFactory.lpPartner(pairAddress);
        expect(partnerData.partner).to.equal(partner.address);
        expect(partnerData.fee).to.equal(1234);

        await expect(pairFactory.setPartner(pairAddress, partner.address, -1)).to.be.reverted;
        await expect(pairFactory.setPartner(pairAddress, partner.address, 5001)).to.be.reverted;

        // Stable fee (1-25)
        await pairFactory.setFee(true, 1);
        await pairFactory.setFee(true, 25);
        await pairFactory.setFee(true, 10);
        expect(await pairFactory.stableFee()).to.equal(10);

        await expect(pairFactory.setFee(true, -1)).to.be.reverted;
        await expect(pairFactory.setFee(true, 0)).to.be.reverted;
        await expect(pairFactory.setFee(true, 26)).to.be.reverted;

        // Volatile fee (1-25)
        await pairFactory.setFee(false, 1);
        await pairFactory.setFee(false, 25);
        await pairFactory.setFee(false, 10);
        expect(await pairFactory.stableFee()).to.equal(10);

        await expect(pairFactory.setFee(false, -1)).to.be.reverted;
        await expect(pairFactory.setFee(false, 0)).to.be.reverted;
        await expect(pairFactory.setFee(false, 26)).to.be.reverted;


        // Degen fee (1-100)
        await pairFactory.setDegenFee(1);
        await pairFactory.setDegenFee(100);
        await pairFactory.setDegenFee(10);
        expect(await pairFactory.degenFee()).to.equal(10);

        await expect(pairFactory.setDegenFee(-1)).to.be.reverted;
        await expect(pairFactory.setDegenFee(0)).to.be.reverted;
        await expect(pairFactory.setDegenFee(101)).to.be.reverted;
    });

    it("Reads the correct fee type", async function() {
        const pairContract = await ethers.getContractFactory("Pair");

        const stableAddress = await pairFactory.getPair(tokenA.address, tokenB.address, true);
        const stablePair = await pairContract.attach(stableAddress);

        const volatileAddress = await pairFactory.getPair(tokenA.address, tokenC.address, false);
        const volatilePair = await pairContract.attach(volatileAddress);

        await pairFactory.setFee(true, 1);
        await pairFactory.setFee(false, 2);
        await pairFactory.setDegenFee(3);

        // Verify correct fee type is selected
        expect(await pairFactory.getFee(false, false)).to.equal(2);
        expect(await pairFactory.getFee(false, true)).to.equal(3);
        expect(await pairFactory.getFee(true, false)).to.equal(1);
        expect(await pairFactory.getFee(true, true)).to.equal(1);

        // Verify pairs are configured correctly
        expect(await stablePair.stable()).to.equal(true);
        expect(await volatilePair.stable()).to.equal(false);

        // Flip degen
        expect(await volatilePair.degen()).to.equal(false);
        await volatilePair.flipDegen();
        expect(await volatilePair.degen()).to.equal(true);
        await volatilePair.flipDegen();
        expect(await volatilePair.degen()).to.equal(false);
    });

    it("Can add liqudiity", async function() {
        // Verify initial liquidity
        let pairLiquidity = await router.getReserves(tokenA.address, tokenB.address, true);
        expect(pairLiquidity.reserveA).to.equal("0");
        expect(pairLiquidity.reserveB).to.equal("0");

        // Add liquidity
        const deadline = 2147483647; // 2**31-1
        let amount = ethers.utils.parseUnits("10000", 18);

        let amountA, amountB, liquidity = await router.connect(investor).addLiquidity(
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

        // Verify final liquidity
        pairLiquidity = await router.getReserves(tokenA.address, tokenB.address, true);
        expect(pairLiquidity.reserveA).to.equal(amount);
        expect(pairLiquidity.reserveB).to.equal(amount);
    });

    it("Correctly calculates stable and owner fees", async function() {
        const pairContract = await ethers.getContractFactory("Pair");
        const stableAddress = await pairFactory.getPair(tokenA.address, tokenB.address, true);
        const stablePair = await pairContract.attach(stableAddress);
        const deadline = 2147483647; // 2**31-1

        expect(await stablePair.stable()).to.equal(true);
        expect(await stablePair.degen()).to.equal(false);

        // Add liquidity
        let amount = ethers.utils.parseUnits("10000", 18);

        let amountA, amountB, liquidity = await router.connect(investor).addLiquidity(
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

        // Trade
        let startOwnerBalance = await tokenA.balanceOf(owner.address);
        let tradeAmount = ethers.utils.parseUnits("100", 18);

        await router.connect(trader).swapExactTokensForTokens(
            tradeAmount,
            0,
            [{"from": tokenA.address, "to": tokenB.address, "stable": true}],
            trader.address,
            deadline
        );

        // Verify total fee
        let reserves = await router.connect(trader).getReserves(
            tokenA.address, tokenB.address, true);

        let reserveA = reserves.reserveA;
        let totalFee = amount.add(tradeAmount).sub(reserveA);
        let totalFeeExpected = tradeAmount.mul(4).div(10000);

        expect(totalFee).to.equal(totalFeeExpected);

        // Verify owner fee
        await stablePair.claimOwnerFees();
        let endOwnerBalance = await tokenA.balanceOf(owner.address);
        let ownerProfit = endOwnerBalance.sub(startOwnerBalance);
        let ownerProfitExpected = totalFeeExpected.mul(3).div(10);
        expect(ownerProfit).to.equal(ownerProfitExpected);
    });

    it("Correctly calculates volatile and partner fees", async function() {
        const pairContract = await ethers.getContractFactory("Pair");
        const volatileAddress = await pairFactory.getPair(tokenA.address, tokenC.address, false);
        const volatilePair = await pairContract.attach(volatileAddress);
        const deadline = 2147483647; // 2**31-1

        expect(await volatilePair.stable()).to.equal(false);
        expect(await volatilePair.degen()).to.equal(false);

        await pairFactory.connect(owner).setPartner(volatilePair.address, partner.address, 5000);

        // Add liquidity
        let amount = ethers.utils.parseUnits("10000", 18);

        let amountA, amountC, liquidity = await router.connect(investor).addLiquidity(
            tokenA.address,
            tokenC.address,
            false,
            amount,
            amount,
            "0",
            "0",
            investor.address,
            deadline
        );

        // Trade
        let startPartnerBalance = await tokenA.balanceOf(partner.address);
        let tradeAmount = ethers.utils.parseUnits("100", 18);

        await router.connect(trader).swapExactTokensForTokens(
            tradeAmount,
            0,
            [{"from": tokenA.address, "to": tokenC.address, "stable": false}],
            trader.address,
            deadline
        );

        // Verify total fee
        let reserves = await router.connect(trader).getReserves(
            tokenA.address, tokenC.address, false);

        let reserveA = reserves.reserveA;
        let totalFee = amount.add(tradeAmount).sub(reserveA);
        let totalFeeExpected = tradeAmount.mul(18).div(10000);

        expect(totalFee).to.equal(totalFeeExpected);

        // Verify partner fee
        let endPartnerBalance = await tokenA.balanceOf(partner.address);
        let partnerProfit = endPartnerBalance.sub(startPartnerBalance);
        let partnerProfitExpected = totalFeeExpected.mul(5).div(10);
        expect(partnerProfit).to.equal(partnerProfitExpected);
    });

    it("Correctly calculates degen fees", async function() {
        const pairContract = await ethers.getContractFactory("Pair");
        const degenAddress = await pairFactory.getPair(tokenA.address, tokenC.address, false);
        const degenPair = await pairContract.attach(degenAddress);
        const deadline = 2147483647; // 2**31-1

        degenPair.connect(owner).flipDegen();

        expect(await degenPair.stable()).to.equal(false);
        expect(await degenPair.degen()).to.equal(true);

        // Add liquidity
        let amount = ethers.utils.parseUnits("10000", 18);

        let amountA, amountC, liquidity = await router.connect(investor).addLiquidity(
            tokenA.address,
            tokenC.address,
            false,
            amount,
            amount,
            "0",
            "0",
            investor.address,
            deadline
        );

        // Trade
        let startPartnerBalance = await tokenA.balanceOf(partner.address);
        let tradeAmount = ethers.utils.parseUnits("100", 18);

        await router.connect(trader).swapExactTokensForTokens(
            tradeAmount,
            0,
            [{"from": tokenA.address, "to": tokenC.address, "stable": false}],
            trader.address,
            deadline
        );

        // Verify total fee
        let reserves = await router.connect(trader).getReserves(
            tokenA.address, tokenC.address, false);

        let reserveA = reserves.reserveA;
        let totalFee = amount.add(tradeAmount).sub(reserveA);
        let totalFeeExpected = tradeAmount.mul(100).div(10000);
        expect(totalFee).to.equal(totalFeeExpected);
    });

    it("Generate permit for gasless approval (for removeLiquidityWithPermit)", async function() {
        const pairAddress = await pairFactory.getPair(tokenA.address, tokenB.address, true);

        const pairContract = await ethers.getContractFactory("Pair");
        const pair = pairContract.attach(pairAddress);

        const lpName = await pair.name();
        const valueToSpend = ethers.utils.parseUnits("100", 18);
        const deadline = 1807228800;
    
        const Permit = [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
        ]
    
        const domain = {
            name: lpName,
            version: '1',
            chainId: 31337, // Default hardhat chainId
            verifyingContract: pair.address,
        };
        
        // The named list of all type definitions
        const types = {
            Permit
        };
        
        // The data to sign
        const value = {
            owner: trader.address,
            spender: router.address,
            value: valueToSpend,
            nonce: ethers.utils.hexlify(await pair.nonces(trader.address)),
            deadline: deadline,
        };
        
        signature = await trader._signTypedData(domain, types, value);
        const splitted = ethers.utils.splitSignature( signature );

        await pair.connect(trader).permit(
            trader.address, 
            router.address, 
            valueToSpend, 
            deadline, 
            splitted.v, 
            splitted.r, 
            splitted.s
        );
    });
});
