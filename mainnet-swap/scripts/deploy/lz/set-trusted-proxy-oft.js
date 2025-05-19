const hre = require("hardhat");

async function main() {
    const signer = (await hre.ethers.getSigners())[0];
    const contract = await hre.ethers.getContractAt(
        'ProxyOFT', '0xdBFB9Ee5e94f5487078a14605eB7ca901Be5625E', signer);

    let succ = await contract.setTrustedRemote(govAddress);

    console.log("Result: %s", succ);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
