const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Gauge", function() {
    let provider, VE, ART, TOKEN, PROXY_OFT, ROUTER, GAUGE_F, BRIBE_F, BRIBE_TOKEN;
    let REWARD_DIST, MINTER, VOTER, BLUECHIP_VOTER, PAIR_F;
    let owner, investor1, investor2, investor3, lzEndpoint;
    let testTokens = [];
    let investors = [];

    before(async () => {
        await hre.network.provider.send("hardhat_reset");
    });

    beforeEach(async () => {
        // Set next sunday
        let dayOfWeek = new Date(await time.latest() * 1000).getDay();
        await time.increase(60 * 60 * 24 * (7 - dayOfWeek)); 

        [owner, investor1, investor2, investor3, lzEndpoint, bluechipFeeCollector] = await ethers.getSigners();
        provider = ethers.getDefaultProvider();

        const PAIRFContract = await ethers.getContractFactory("PairFactory");
        PAIR_F = await PAIRFContract.deploy();
        await PAIR_F.deployed();

        const TOKENContract = await ethers.getContractFactory("Token");
        TOKEN = await TOKENContract.deploy();
        await TOKEN.deployed();
        await TOKEN.initialMint(owner.address);

        const PROXYOFTContract = await ethers.getContractFactory("ProxyOFT");
        PROXY_OFT = await PROXYOFTContract.deploy(
            lzEndpoint.address, // _lzEndpoint
            TOKEN.address, // _token
        );
        await PROXY_OFT.deployed();

        const DUMMYContract = await ethers.getContractFactory("DummyToken");
        investors = [investor1, investor2, investor3];
        let tmpToken;

        for (let i = 0; i < 2; i++) {
            tmpToken = await DUMMYContract.deploy(owner.address);
            await tmpToken.deployed();

            for (let j = 0; j < investors.length; j++) {
                tmpToken.connect(owner).approve(investors[j].address, ethers.constants.MaxUint256);
                tmpToken.connect(owner).transfer(investors[j].address, ethers.utils.parseUnits('100', 18));
            }

            testTokens.push(tmpToken);
        }

        // Bribe token
        const BribeTokenContract = await ethers.getContractFactory("DummyToken");
        BRIBE_TOKEN = await BribeTokenContract.deploy(owner.address);
        await BRIBE_TOKEN.deployed();

        const ArtContract = await ethers.getContractFactory("VeArt");
        ART = await upgrades.deployProxy(ArtContract, []);
        await ART.deployed();

        const VEContract = await ethers.getContractFactory("VotingEscrow");
        VE = await VEContract.deploy(TOKEN.address, ART.address);
        await VE.deployed();

        const BRIBEContract = await ethers.getContractFactory("BribeFactoryV2");
        BRIBE_F = await upgrades.deployProxy(BRIBEContract, [owner.address]);
        await BRIBE_F.deployed();

        const GAUGEContract = await ethers.getContractFactory("GaugeFactoryV2");
        GAUGE_F = await upgrades.deployProxy(GAUGEContract, []);
        await GAUGE_F.deployed();

        const VOTERContract = await ethers.getContractFactory("VoterV2_1");
        VOTER = await upgrades.deployProxy(VOTERContract, [
            VE.address, PAIR_F.address, GAUGE_F.address, BRIBE_F.address, PROXY_OFT.address]);
        await VOTER.deployed();

        await BRIBE_F.setVoter(VOTER.address);

        const BLUECHIP_VOTERContract = await ethers.getContractFactory("BluechipVoter");
        BLUECHIP_VOTER = await upgrades.deployProxy(BLUECHIP_VOTERContract, [
            VE.address, PAIR_F.address, GAUGE_F.address, PROXY_OFT.address, bluechipFeeCollector.address]);
        await BLUECHIP_VOTER.deployed();

        const RDContract = await ethers.getContractFactory("RewardsDistributor");
        REWARD_DIST = await RDContract.deploy(VE.address, TOKEN.address);
        await REWARD_DIST.deployed();

        const MINTERContract = await ethers.getContractFactory("Minter");
        MINTER = await upgrades.deployProxy(MINTERContract, [
            VOTER.address, BLUECHIP_VOTER.address, VE.address, REWARD_DIST.address]);
        await MINTER.deployed();

        await VE.setVoter(VOTER.address, BLUECHIP_VOTER.address);
        await TOKEN.setMinter(MINTER.address);
        await VOTER.setMinter(MINTER.address);
        await BLUECHIP_VOTER.setMinter(MINTER.address);
        await REWARD_DIST.setDepositor(MINTER.address);
        await MINTER._initialize([], [], 0);

        // create veNFT lock
        for (let i = 0; i < investors.length; i++) {
            TOKEN.connect(owner).approve(investors[i].address, ethers.constants.MaxUint256);
            TOKEN.connect(owner).transfer(investors[i].address, ethers.utils.parseUnits('100', 18));
            await TOKEN.connect(investors[i]).approve(VE.address, ethers.constants.MaxUint256);
            if (i != 2) {
                await VE.connect(investors[i]).create_lock(ethers.utils.parseUnits('10', 18), 2 * 365 * 86400); // 2 years
            }
        }

        // Router
        const ROUTERContract = await ethers.getContractFactory("Router");
        ROUTER = await ROUTERContract.deploy(PAIR_F.address, TOKEN.address);
        await ROUTER.deployed();

        for (let i = 0; i < testTokens.length; i++) {
            await testTokens[i].connect(investor1).approve(ROUTER.address, ethers.constants.MaxUint256);
        };

        // Add one gauge to make it work -- prevent division by zero totalWeight
        await BLUECHIP_VOTER.createGauge(testTokens[0].address, 0);
        await BLUECHIP_VOTER.connect(owner).vote([await BLUECHIP_VOTER.gaugeList(0)], [100]);

    });


    it("Can only claim own rewards", async function() {
        // Setup
        const token = testTokens[testTokens.length-1];
        let NFTs = [
            await VE.tokenOfOwnerByIndex(investor1.address, 0),
            await VE.tokenOfOwnerByIndex(investor2.address, 0),
            0,
        ]
        const bribe_amount = ethers.utils.parseUnits("100", 18);

        await VOTER.createGauge(token.address, 0);
        const gaugeContract = await ethers.getContractFactory("GaugeV2");
        const gauge0_address = await VOTER.gaugeList(0);
        const gauge = await gaugeContract.attach(gauge0_address);
        const gauge_bribes = await VOTER.external_bribes(gauge.address);

        const bribes_contract = await hre.ethers.getContractAt('Bribe', gauge_bribes, owner);
        await bribes_contract.addRewardToken(BRIBE_TOKEN.address);
        await BRIBE_TOKEN.approve(bribes_contract.address, bribe_amount.mul(10));

        for (let i = 0; i < investors.length; i++) {
            await token.connect(investors[i]).approve(gauge.address, ethers.constants.MaxUint256);
            await gauge.connect(investors[i]).depositAll(NFTs[i]);
        }

        let new_bribes = [
            await BRIBE_TOKEN.balanceOf(investor1.address),
            await BRIBE_TOKEN.balanceOf(investor2.address),
            await BRIBE_TOKEN.balanceOf(investor3.address)
        ]
        let old_bribes, notified_amount;

        for (let epoch = 0; epoch < 8; epoch++) {
            console.log("----------[ Epoch " + epoch + " ]----------");

            // Bribes
            await bribes_contract.notifyRewardAmount(BRIBE_TOKEN.address, bribe_amount);
            if (epoch >= 4) {
                await VOTER.distributeAll();
            }

            // Voting
            if (epoch >= 3) {
                await VOTER.connect(investor1).vote(NFTs[0], [gauge0_address], [1000]);
                await VOTER.connect(investor1).claimBribes([gauge_bribes], [[BRIBE_TOKEN.address]], NFTs[0]);
            }

            if (epoch == 4) {
                await VE.connect(investors[2]).create_lock(ethers.utils.parseUnits('10', 18), 2 * 365 * 86400);
                NFTs[2] = await VE.tokenOfOwnerByIndex(investor3.address, 0);
            }

            if (epoch >= 4) {
                await VOTER.connect(investor2).vote(NFTs[1], [gauge0_address], [1000]);
                await VOTER.connect(investor3).vote(NFTs[2], [gauge0_address], [1000]);
                await VOTER.connect(investor2).claimBribes([gauge_bribes], [[BRIBE_TOKEN.address]], NFTs[1]);
                await VOTER.connect(investor3).claimBribes([gauge_bribes], [[BRIBE_TOKEN.address]], NFTs[2]);
            }

            old_bribes = new_bribes;
            new_bribes = [
                await BRIBE_TOKEN.balanceOf(investor1.address),
                await BRIBE_TOKEN.balanceOf(investor2.address),
                await BRIBE_TOKEN.balanceOf(investor3.address)
            ]
            notified_amount = bribe_amount.mul(epoch + 1);

            // console.log(new_bribes);
            console.log("Total notified: " + ethers.utils.formatEther(notified_amount));
            console.log("Total received: " + ethers.utils.formatEther(
                new_bribes[0].add(new_bribes[1]).add(new_bribes[2])));
            console.log("New investor1:  " + ethers.utils.formatEther(new_bribes[0].sub(old_bribes[0])));
            console.log("New investor2:  " + ethers.utils.formatEther(new_bribes[1].sub(old_bribes[1])));
            console.log("New investor3:  " + ethers.utils.formatEther(new_bribes[2].sub(old_bribes[2])));

            if (epoch == 0) {
                await time.increase(60 * 60 * 24 * 4);
            } else {
                await time.increase(60 * 60 * 24 * 7);
            }
        }
    });
});
