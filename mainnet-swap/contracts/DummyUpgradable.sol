// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract DummyUpgradable is OwnableUpgradeable {
    uint256 public constant maxSupply = 100;
    uint256 public value;
    uint256 public counter;

    function initialize(uint256 _value) initializer public {
        value = _value;
    }
    
    function increaseCounter() external {
        counter += 1;
    }

    function greet() external pure returns (string memory) {
        return "Whats up! V1";
    }
}
