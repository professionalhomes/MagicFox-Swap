const hre = require("hardhat");

module.exports = [
    '0xB48837F0C05c0931c7B3DcFDceA0365396c39F3A', // address _token, 
    hre.ethers.constants.AddressZero, // address _saleToken, 
    hre.ethers.utils.parseUnits("100"), // uint256 _softCap, 
    hre.ethers.utils.parseUnits("200"), // uint256 _hardCap, 
    hre.ethers.utils.parseUnits("0.0001"), // uint256 _pricePerToken, 
    '1686125812', // uint256 _startTime, 
    '1686143812', // uint256 _endTime,
    '0x16a22488426742CDe589BC1D299D55BfaF28093d', // address _treasury
]

// async function main() {
//     const addresses = hre.network.config.constants;
//     const ContractF = await hre.ethers.getContractFactory("Presale");

//     console.log("REMOVE TESTING FUNCTIONS !!!");
//     console.log("REMOVE TESTING FUNCTIONS !!!");
//     console.log("REMOVE TESTING FUNCTIONS !!!");

//     const contr = await ContractF.deploy(
//         '0xB48837F0C05c0931c7B3DcFDceA0365396c39F3A', // address _token, 
//         hre.ethers.constants.AddressZero, // address _saleToken, 
//         hre.ethers.utils.parseUnits("100"), // uint256 _softCap, 
//         hre.ethers.utils.parseUnits("200"), // uint256 _hardCap, 
//         hre.ethers.utils.parseUnits("0.0001"), // uint256 _pricePerToken, 
//         '1686125812', // uint256 _startTime, 
//         '1686143812', // uint256 _endTime,
//         '0x16a22488426742CDe589BC1D299D55BfaF28093d', // address _treasury
//     );

//     await contr.deployed();

//     console.log("Presale deployed to: %saddress/%s", hre.network.config.explorer, contr.address);
// }

// main()
//     .then(() => process.exit(0))
//     .catch(error => {
//         console.error(error);
//         process.exit(1);
//     });
