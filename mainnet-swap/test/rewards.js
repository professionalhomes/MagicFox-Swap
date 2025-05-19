const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

describe("Swap", function() {
    let owner, tokenOwner, traderA, traderB;
    let pairFactory, router, veart, escrow, distributor,  WETH, tokenFox, tokenUsdc, lockDuration30, lockDuration60;

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
        lockDuration30 = 60 * 60 * 24 * 30;
        lockDuration60 = 60 * 60 * 24 * 60;
    });

    it("Locks funds and allows withdrawal after time limit", async function() {
        // Configure time, amounts
        await time.advanceBlock()
        let lastTimestamp = await time.latestBlock();
        let unlockTime = lastTimestamp + lockDuration30;
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
        await time.increase(lockDuration30);
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
        let unlockTime = lastTimestamp + lockDuration30;
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
        await time.increase(lockDuration30);

        await expect(escrow.connect(traderA).withdraw(NFT)).to.be.reverted;
        await escrow.connect(traderB).withdraw(NFT);

        // Verify withdraw can only happen once
        await expect(escrow.connect(traderB).withdraw(NFT)).to.be.reverted;
    });

    it("Distributes rewards proportionally", async function() {
        // Configure time, amounts
        await time.advanceBlock()
        let lastTimestamp = await time.latestBlock();

        const amount = ethers.utils.parseUnits("100", 18);
        const amountReward = amount.div(10);
        let currAmt = BigNumber.from(0);

        // Set day of the week
        let dayOfWeek = new Date(await time.latest() * 1000).getDay();
        await time.increase(60 * 60 * 24 * (12 - dayOfWeek));

        // Lock
        let lock = await escrow.connect(traderA).create_lock(amount, lastTimestamp + lockDuration30);
        let lockEvents = (await lock.wait())["events"];
        let NFTA, NFTB;

        for (let i = 0; i < lockEvents.length; i++) {
            if (lockEvents[i]["event"] == "Deposit") {
                NFTA = lockEvents[i]["args"][1];
                break;
            }
        }

        lock = await escrow.connect(traderB).create_lock(amount, lastTimestamp + lockDuration60);
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
        const warmup = 3;

        for (let day = 1; day <= 70; day++) {
            await time.increase(60 * 60 * 24);
            await tokenFox.connect(tokenOwner).transfer(distributor.address, amountReward);
            currAmt = currAmt.add(amountReward);

            await distributor.checkpoint_total_supply();
            await distributor.checkpoint_token();

            if (day % 7 == 0) {
                claimableA = await distributor.claimable(NFTA);
                claimableB = await distributor.claimable(NFTB);

                // A has a 30day lock (ends in 5th week)
                if (day > 7 && day <= 30) {
                    expect(claimableA).to.be.above(0);
                } else {
                    expect(claimableA).to.equal(0);
                }

                // B has a 60 day lock (ends in 9th week)
                if (day > 7 && day <= 60) {
                    expect(claimableB).to.be.above(0);
                } else {
                    expect(claimableB).to.equal(0);
                }

                // B should receive more because of a longer lock period
                if (claimableA > 0) {
                    expect(claimableB).to.be.above(claimableA);
                }

                await distributor.claim_many([NFTA, NFTB]);

                /*
                console.log(`${ethers.utils.formatEther(claimableA)} -- claimable amount voter_A (30 days lock)`);
                console.log(`${ethers.utils.formatEther(claimableB)} -- claimable amount voter_B (60 days lock)`);
                console.log(`${ethers.utils.formatEther(claimableA.add(claimableB))} -- claimable amount all voters`);
                console.log(`${ethers.utils.formatEther(currAmt)} -- reward transfered for previous week`);
                console.log('--------------------');
                */
            
                currAmt = BigNumber.from(0);
            }
        }

         const diffBalanceA = (await tokenFox.balanceOf(traderA.address)).sub(startBalanceA);
         const diffBalanceB = (await tokenFox.balanceOf(traderB.address)).sub(startBalanceB);
    });

    it("Can claim rewards before and after unlock", async function() {
        // Configure time, amounts
        await time.advanceBlock()
        let lastTimestamp = await time.latestBlock();

        const amount = ethers.utils.parseUnits("100", 18);

        // Lock
        const traders = [traderA, traderB];
        let NFTS = [null, null];
        let lock, lockEvents;

        for (let i = 0; i < traders.length; i++) {
            lock = await escrow.connect(traders[i]).create_lock(amount, lastTimestamp + lockDuration30);
            lockEvents = (await lock.wait())["events"];

            for (let j = 0; j < lockEvents.length; j++) {
                if (lockEvents[j]["event"] == "Deposit") {
                    NFTS[i] = lockEvents[j]["args"][1];
                }
            }
        }

        // Start
        const startBalanceA = await tokenFox.balanceOf(traders[0].address);
        const startBalanceB = await tokenFox.balanceOf(traders[1].address);
        const startNftA = await escrow.balanceOfNFT(NFTS[0]);
        const startNftB = await escrow.balanceOfNFT(NFTS[1]);

        expect(startBalanceA).to.equal(startBalanceB);
        expect(startNftA).to.equal(startNftB);

        // Midpoint
        await time.increase(60 * 60 * 24 * 15);
        await tokenFox.connect(tokenOwner).transfer(distributor.address, amount);

        await distributor.checkpoint_total_supply();
        await distributor.checkpoint_token();

        let claimableA = await distributor.claimable(NFTS[0]);
        let claimableB = await distributor.claimable(NFTS[1]);

        expect(claimableA).to.equal(claimableB);

        // Only A claims and receives balance to lock, not wallet!
        await distributor.claim(NFTS[0]);

        expect(await tokenFox.balanceOf(traders[0].address)).to.equal(startBalanceA);
        expect(await tokenFox.balanceOf(traders[1].address)).to.equal(startBalanceB);
        expect(await escrow.balanceOfNFT(NFTS[0])).to.be.above(
            await escrow.balanceOfNFT(NFTS[1]));

        // End
        await time.increase(60 * 60 * 24 * 15);

        await distributor.checkpoint_total_supply();
        await distributor.checkpoint_token();

        claimableA = await distributor.claimable(NFTS[0]);
        claimableB = await distributor.claimable(NFTS[1]);

        expect(claimableB).to.be.above(claimableA);

        await distributor.claim_many(NFTS);

        for (let i = 0; i < traders.length; i++) {
            await escrow.connect(traders[i]).withdraw(NFTS[i]);
        }

        // At the end both traders should get the same amount
        const endBalanceA = await tokenFox.balanceOf(traders[0].address);
        const endBalanceB = await tokenFox.balanceOf(traders[1].address);

        expect(endBalanceA).to.be.above(startBalanceA);
        expect(endBalanceA).to.equal(endBalanceB);
    });

    it("Supports rewards in a different curency", async function() {
        // Reward Distributor
        const distributorContract = await ethers.getContractFactory("RewardsDistributor");
        distributorUsdc = await distributorContract.deploy(escrow.address, tokenUsdc.address);
        await distributorUsdc.deployed();

        // Configure time, amounts
        await time.advanceBlock()
        let lastTimestamp = await time.latestBlock();

        const amount = ethers.utils.parseUnits("100", 18);

        // Lock
        let NFT;

        const lock = await escrow.connect(traderA).create_lock(amount, lastTimestamp + lockDuration30);
        const lockEvents = (await lock.wait())["events"];

        for (let i = 0; i < lockEvents.length; i++) {
            if (lockEvents[i]["event"] == "Deposit") {
                NFT = lockEvents[i]["args"][1];
            }
        }

        // Start
        const startBalanceFox = await tokenFox.balanceOf(traderA.address);
        const startBalanceUsdc = await tokenUsdc.balanceOf(traderA.address);
        const startBalanceNFT = await escrow.balanceOfNFT(NFT);

        // Midpoint - we also transfer FOX just to make sure it doesn't do anything
        await time.increase(60 * 60 * 24 * 15);
        await tokenFox.connect(tokenOwner).transfer(distributorUsdc.address, amount);
        await tokenUsdc.connect(tokenOwner).transfer(distributorUsdc.address, amount);

        await distributorUsdc.checkpoint_total_supply();
        await distributorUsdc.checkpoint_token();

        // Trader receives balance immediately and in distributor token
        let claimable = await distributorUsdc.claimable(NFT);
        expect(claimable).to.be.above(0);
        await distributorUsdc.claim(NFT);

        expect(await tokenFox.balanceOf(traderA.address)).to.equal(startBalanceFox);
        expect(await tokenUsdc.balanceOf(traderA.address)).to.be.above(startBalanceUsdc);

        // End
        await time.increase(60 * 60 * 24 * 15);
        await distributorUsdc.checkpoint_total_supply();
        await distributorUsdc.checkpoint_token();

        claimable = await distributorUsdc.claimable(NFT);
        expect(claimable).to.be.above(0);
        await distributorUsdc.claim(NFT);

        expect(await tokenFox.balanceOf(traderA.address)).to.equal(startBalanceFox);
        expect(await tokenUsdc.balanceOf(traderA.address)).to.be.above(startBalanceUsdc);
    });
});

