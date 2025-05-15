const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Swap", function() {
    let owner, tokenOwner, traderA, traderB;
    let pairFactory, router, veart, escrow, distributor,  WETH, tokenFox, tokenUsdc, lockDuration;

    before(async () => {
        await hre.network.provider.send("hardhat_reset");
    });

    beforeEach(async () => {
        [ owner, tokenOwner, traderA, traderB ] = await ethers.getSigners();

        // Tokens
        const tokenContract = await ethers.getContractFactory("DummyToken");

        WETH = await tokenContract.deploy(tokenOwner.address);
        tokenFox = await tokenContract.deploy(tokenOwner.address);
        tokenUsdc = await tokenContract.deploy(tokenOwner.address);
        await WETH.deployed();
        await tokenFox.deployed();
        await tokenUsdc.deployed();

        // Pair Factory
        const pairFactoryContract = await ethers.getContractFactory("PairFactory");
        pairFactory = await pairFactoryContract.deploy();
        await pairFactory.deployed();

        // Router
        const routerContract = await ethers.getContractFactory("Router");
        router = await routerContract.deploy(pairFactory.address, WETH.address);
        await router.deployed();

        // Pairs
        await pairFactory.createPair(tokenFox.address, tokenUsdc.address, true); // Stable pair

        // VeArt
        const veartContract = await ethers.getContractFactory("VeArt");
        veart = await veartContract.deploy();
        await veart.deployed();

        // Voting Escrow
        const escrowContract = await ethers.getContractFactory("VotingEscrow");
        escrow = await escrowContract.deploy(tokenFox.address, veart.address);
        await escrow.deployed()

        // Reward Distributor
        const distributorContract = await ethers.getContractFactory("RewardsDistributor");
        distributor = await distributorContract.deploy(escrow.address, tokenFox.address);
        await distributor.deployed()

        // Transfer tokens from token owner and approve
        let amount = ethers.utils.parseUnits("10000", 18);
        let tokens = [tokenFox, tokenUsdc];
        let recipients = [traderA, traderB];

        for (let i = 0; i < tokens.length; i++) {
            for (j = 0; j < recipients.length; j++) {
                tokens[i].connect(tokenOwner).transfer(recipients[j].address, amount);
                await tokens[i].connect(recipients[j]).approve(router.address, amount);
                await tokens[i].connect(recipients[j]).approve(escrow.address, amount);
            };
        };

        // Some helpers to avoid repeating in each test
        lockDuration = 60 * 60 * 24 * 30;
    });

    it("Locks funds and allows withdrawal after time limit", async function() {
        // Configure time, amounts
        await time.advanceBlock()
        let lastTimestamp = await time.latestBlock();
        let unlockTime = lastTimestamp + lockDuration;
        let amount = ethers.utils.parseUnits("100", 18);

        // Lock
        const startBalance = await tokenFox.balanceOf(traderA.address);
        const lock = await escrow.connect(traderA).create_lock(amount, unlockTime);
        const lockEvents = (await lock.wait())["events"];
        let NFT;

        for (let i = 0; i < lockEvents.length; i++) {
            if (lockEvents[i]["event"] == "Deposit") {
                NFT = lockEvents[i]["args"][1];
                break;
            }
        }

        let balance = await tokenFox.balanceOf(traderA.address);
        expect(balance).to.equal(startBalance.sub(amount));

        // Verify the user can not immediately unlock the funds
        await expect(escrow.connect(traderA).withdraw(NFT)).to.be.reverted;

        // Verify another user can not withdraw the funds after the unlock time is reached
        await time.increase(lockDuration);
        await expect(escrow.connect(traderB).withdraw(NFT)).to.be.reverted;

        // Verify the user can unlock the funds after the unlock time is reached
        await escrow.connect(traderA).withdraw(NFT);

        balance = await tokenFox.balanceOf(traderA.address);
        expect(balance).to.equal(startBalance);
    });

    it("Lock and withdraw token for other", async function() {
        // Configure time, amounts
        await time.advanceBlock()
        let lastTimestamp = await time.latestBlock();
        let unlockTime = lastTimestamp + lockDuration;
        let amount = ethers.utils.parseUnits("100", 18);

        // Lock
        const lock = await escrow.connect(traderA).create_lock_for(amount, unlockTime, traderB.address);
        const lockEvents = (await lock.wait())["events"];
        let NFT;

        for (let i = 0; i < lockEvents.length; i++) {
            if (lockEvents[i]["event"] == "Deposit") {
                NFT = lockEvents[i]["args"][1];
                break;
            }
        }

        // Verify either user can't withdraw immediately
        await expect(escrow.connect(traderA).withdraw(NFT)).to.be.reverted;
        await expect(escrow.connect(traderB).withdraw(NFT)).to.be.reverted;

        // Verify only the assigned user can withdraw after the expiration
        await time.increase(lockDuration);

        await expect(escrow.connect(traderA).withdraw(NFT)).to.be.reverted;
        await escrow.connect(traderB).withdraw(NFT);

        // Verify withdraw can only happen once
        await expect(escrow.connect(traderB).withdraw(NFT)).to.be.reverted;
    });

    it("Distributes rewards proportionally", async function() {
        // Configure time, amounts
        await time.advanceBlock()
        let lastTimestamp = await time.latestBlock();
        let unlockTime = lastTimestamp + lockDuration;

        const amountA = ethers.utils.parseUnits("100", 18);
        const amountB = amountA.mul(2);
        const amountReward = amountA.div(10);

        // Lock
        let lock = await escrow.connect(traderA).create_lock(amountA, unlockTime);
        let lockEvents = (await lock.wait())["events"];
        let NFTA, NFTB;

        for (let i = 0; i < lockEvents.length; i++) {
            if (lockEvents[i]["event"] == "Deposit") {
                NFTA = lockEvents[i]["args"][1];
                break;
            }
        }

        lock = await escrow.connect(traderB).create_lock(amountB, unlockTime);
        lockEvents = (await lock.wait())["events"];

        for (let i = 0; i < lockEvents.length; i++) {
            if (lockEvents[i]["event"] == "Deposit") {
                NFTB = lockEvents[i]["args"][1];
                break;
            }
        }

        const startBalanceA = await tokenFox.balanceOf(traderA.address);
        const startBalanceB = await tokenFox.balanceOf(traderB.address);

        // Verify claimable
        expect(await distributor.claimable(NFTA)).to.equal(0);
        expect(await distributor.claimable(NFTB)).to.equal(0);

        // Add rewards
        let claimableA, claimableB;

        for (let i = 0; i < 30; i++) {
            await time.increase(60 * 60 * 24 * 7);
            await tokenFox.connect(tokenOwner).transfer(distributor.address, amountReward);

            await distributor.checkpoint_total_supply();
            await distributor.checkpoint_token();

        }

        claimableA = await distributor.claimable(NFTA);
        claimableB = await distributor.claimable(NFTB);

        expect(claimableA.mul(2)).to.be.within(claimableB.sub(4), claimableB);

        await distributor.claim(NFTA);
        await distributor.claim(NFTB);

        const diffBalanceA = (await tokenFox.balanceOf(traderA.address)).sub(startBalanceA);
        const diffBalanceB = (await tokenFox.balanceOf(traderB.address)).sub(startBalanceB);

        expect(diffBalanceA).to.equal(claimableA);
        expect(diffBalanceB).to.equal(claimableB);

        expect(diffBalanceA.mul(2)).to.be.within(diffBalanceB.sub(4), diffBalanceB);
    });
});
