const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

describe("Mirror", function() {
    let owner, tokenOwner, traderA, traderB, sidechainVEM;
    let veart, escrow, lzEndpoint, lzEndpoint2, tokenFox, lockDuration30, lockDuration60;

    const SIDECHAIN_ID = 110; // lz Chain id

    /*
     * FOR THIS TEST TO WORK, YOU NEED TO ADD the following code to VotingEscrow:
     *
     * function setLZ(address _lz) external {
     *     lzEndpoint = ILayerZeroEndpoint(_lz);
     * }
     *
     * AND CHANGE lzEndpoint constant to non-constant
     * 
     * Note: 
     * for calling escrow.mirrorToken use lzEndpoint
     * for calling escrow.lzReceive use lzEndpoint2 -- since lzEndpoint is contract and cannot sign transactions
     */

    before(async () => {
        await hre.network.provider.send("hardhat_reset");
    });

    beforeEach(async () => {
        [ owner, tokenOwner, traderA, traderB, sidechainVEM, lzEndpoint2 ] = await ethers.getSigners();

        const lzContract = await ethers.getContractFactory("DummyLZ");
        lzEndpoint = await lzContract.deploy();

        // Tokens
        const tokenContract = await ethers.getContractFactory("DummyToken");
        tokenFox = await tokenContract.deploy(tokenOwner.address);

        // VeArt
        const veartContract = await ethers.getContractFactory("VeArt");
        veart = await upgrades.deployProxy(veartContract, []);
        await veart.deployed();

        // Voting Escrow
        const escrowContract = await ethers.getContractFactory("VotingEscrow");
        escrow = await escrowContract.deploy(tokenFox.address, veart.address);
        await escrow.deployed()

        await escrow.setLZ(lzEndpoint.address);

        // Transfer tokens from token owner and approve
        let amount = ethers.utils.parseUnits("10000", 18);
        let tokens = [tokenFox];
        let recipients = [traderA, traderB];

        for (let i = 0; i < tokens.length; i++) {
            for (j = 0; j < recipients.length; j++) {
                tokens[i].connect(tokenOwner).transfer(recipients[j].address, amount);
                await tokens[i].connect(recipients[j]).approve(escrow.address, amount);
            };
        };

        // Some helpers to avoid repeating in each test
        lockDuration30 = 60 * 60 * 24 * 30;
        lockDuration60 = 60 * 60 * 24 * 60;
    });

    it("Locks funds and mirror", async function() {
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

        expect(await escrow.tokenMirrorCounter(NFT, SIDECHAIN_ID)).to.equal(0);
        expect(await escrow.sidechainVEM(SIDECHAIN_ID)).to.equal(ethers.constants.AddressZero);

        await expect(escrow.mirrorToken(NFT, SIDECHAIN_ID)).to.be.reverted;
        await expect(escrow.connect(traderA).mirrorToken(NFT, SIDECHAIN_ID)).to.be.revertedWith("sidechainVEM not set");
        
        await expect(escrow.connect(traderA).setSidechainVEM(SIDECHAIN_ID, sidechainVEM.address)).to.be.reverted;
        await escrow.setSidechainVEM(SIDECHAIN_ID, sidechainVEM.address);
        expect(await escrow.sidechainVEM(SIDECHAIN_ID)).to.equal(sidechainVEM.address);

        expect(await escrow.attachments(NFT)).to.equal(0);

        await escrow.connect(traderA).mirrorToken(NFT, SIDECHAIN_ID);
        expect(await escrow.tokenMirrorCounter(NFT, SIDECHAIN_ID)).to.equal(1);

        expect(await escrow.attachments(NFT)).to.equal(1);
        
        await escrow.connect(traderA).mirrorToken(NFT, SIDECHAIN_ID);
        const latestMirroredCounter = await escrow.tokenMirrorCounter(NFT, SIDECHAIN_ID);
        expect(latestMirroredCounter).to.equal(2);

        expect(await escrow.attachments(NFT)).to.equal(1);

        // Switch to lzEndpoint2
        await escrow.setLZ(lzEndpoint2.address);

        // simulate lzReceive from sidechain
        let srcAddressPayload = hre.ethers.utils.solidityPack(
            ["address", "address"],
            [sidechainVEM.address, escrow.address]
        );

        // simulate LZ receive -- for some past counter
        let payload = ethers.utils.defaultAbiCoder.encode(
            [ "uint256", "uint256" ], 
            [ NFT, latestMirroredCounter - 1 ] 
        );

        await escrow.connect(lzEndpoint2).lzReceive(SIDECHAIN_ID, srcAddressPayload, 1, payload);

        // shouldn't remove attachments & tokenMirrorCounter status
        expect(await escrow.attachments(NFT)).to.equal(1);
        expect(await escrow.tokenMirrorCounter(NFT, SIDECHAIN_ID)).to.equal(latestMirroredCounter);

        // simulate LZ receive -- for latest token
        payload = ethers.utils.defaultAbiCoder.encode(
            [ "uint256", "uint256" ], 
            [ NFT, latestMirroredCounter ] 
        );

        await escrow.connect(lzEndpoint2).lzReceive(SIDECHAIN_ID, srcAddressPayload, 1, payload);

        // shouldn't remove attachments & tokenMirrorCounter status
        expect(await escrow.attachments(NFT)).to.equal(0);
        expect(await escrow.tokenMirrorCounter(NFT, SIDECHAIN_ID)).to.equal(0);

        // Emergency clear
        // await expect(escrow.connect(traderA).emergencyClear(NFT, SIDECHAIN_ID)).to.be.reverted;
        // await escrow.emergencyClear(NFT, SIDECHAIN_ID);
        // expect(await escrow.attachments(NFT)).to.equal(0);
        // expect(await escrow.tokenMirrorCounter(NFT, SIDECHAIN_ID)).to.equal(0);
    });

});

