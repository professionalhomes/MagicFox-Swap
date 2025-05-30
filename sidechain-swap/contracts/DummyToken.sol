// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DummyToken is ERC20 {
    uint256 public constant maxSupply = 100_000_000 * 1e18;

    constructor(address recipient) ERC20("DummyToken", "DMY") {
        _mint(recipient, maxSupply);
    }
}
