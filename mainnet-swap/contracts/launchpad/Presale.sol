// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IToken {
  function decimals() external returns (uint8);
}

contract Presale is Ownable, ReentrancyGuard {
  using SafeERC20 for IERC20;

  address public immutable TOKEN;
  address public immutable SALE_TOKEN; // token used to participate, if 0x0000... than BNB

  uint256 public immutable SOFTCAP;
  uint256 public immutable HARDCAP;
  uint256 public immutable PRICE_PER_TOKEN; // Price per 1e18 token

  uint256 public START_TIME;
  uint256 public END_TIME;

  address public immutable TREASURY; // treasury multisig, will receive raised amount

  uint256 public soldAmount; // should be <= HARDCAP

  struct UserInfo {
    uint256 quantity;
    uint256 amount;
    bool claimed;
  }

  mapping(address => UserInfo) public userInfo;

  constructor(
    address _token, 
    address _saleToken, 
    uint256 _softCap, 
    uint256 _hardCap, 
    uint256 _pricePerToken, 
    uint256 _startTime, 
    uint256 _endTime,
    address _treasury
  ) {
    require(_hardCap > _softCap);
    TOKEN = _token;
    SALE_TOKEN = _saleToken;

    SOFTCAP = _softCap;
    HARDCAP = _hardCap;
    PRICE_PER_TOKEN = _pricePerToken;

    START_TIME = _startTime;
    END_TIME = _endTime;

    TREASURY = _treasury;

    require(IToken(TOKEN).decimals() == 18);
    if (SALE_TOKEN != address(0)) {
      require(IToken(SALE_TOKEN).decimals() == 18);
    }
  }

  function availableTokens() public view returns (uint256) {
    return HARDCAP - soldAmount;
  }

  function hasStarted() public view returns (bool) {
    return block.timestamp >= START_TIME && IERC20(TOKEN).balanceOf(address(this)) >= HARDCAP;
  }

  function hasEnded() public view returns (bool){
    return END_TIME <= block.timestamp || availableTokens() == 0;
  }

  function isSaleActive() public view returns (bool) {
    return hasStarted() && !hasEnded();
  }

  function totalContributed() public view returns (uint256) {
    return SALE_TOKEN == address(0) ? address(this).balance : IERC20(SALE_TOKEN).balanceOf(address(this));
  }

  function buy(uint256 amount) external payable nonReentrant {
    require(isSaleActive(), "Sale not active");

    uint256 quantity = amount * 1e18 / PRICE_PER_TOKEN;
    uint256 max = availableTokens();
    if (quantity > max){
      quantity = max;
      amount = quantity * PRICE_PER_TOKEN / 1e18;
    }

    if (SALE_TOKEN == address(0)){
      require(msg.value >= amount, "Incorrect BNB amount");

      uint256 leftover = msg.value - amount;
      if (leftover > 0) {
        (bool success, ) = msg.sender.call{value: leftover}("");
        require(success, "msg.sender rejected transfer");
      }

    } else {
      IERC20(SALE_TOKEN).safeTransferFrom(msg.sender, address(this), amount);
    }

    soldAmount += quantity;

    userInfo[msg.sender].quantity += quantity;
    userInfo[msg.sender].amount += amount;
  }

  function claim() external {
    require(hasEnded(), "not ended yet");

    UserInfo memory user = userInfo[msg.sender];
    require(user.amount > 0 && user.quantity > 0, "nothing to claim");
    require(!user.claimed, "already claimed");

    userInfo[msg.sender].claimed = true;

    bool success = soldAmount >= SOFTCAP;

    if (success) {
      // transfer tokens
      IERC20(TOKEN).safeTransfer(msg.sender, user.quantity);
    } else {
      // return sale tokens
      if (SALE_TOKEN == address(0)){
        (bool succ, ) = msg.sender.call{value: user.amount}("");
        require(succ, "msg.sender rejected transfer");

      } else {
        IERC20(SALE_TOKEN).safeTransfer(msg.sender, user.amount);
      }
    }
  }

  function treasuryClaim() external {
    require(msg.sender == TREASURY, "not treasury");
    require(hasEnded(), "not ended yet");

    bool success = soldAmount >= SOFTCAP;

    if (success) {
      if (SALE_TOKEN == address(0)){
        (bool succ, ) = TREASURY.call{value: address(this).balance}("");
        require(succ, "TREASURY rejected transfer");

      } else {
        IERC20(SALE_TOKEN).safeTransfer(TREASURY, IERC20(SALE_TOKEN).balanceOf(address(this)));
      }

      // Also transfer unsold tokens
      IERC20(TOKEN).safeTransfer(TREASURY, availableTokens());

    } else {
      // Return all tokens to treasury
      IERC20(TOKEN).safeTransfer(TREASURY, IERC20(TOKEN).balanceOf(address(this)));
    }
  }

  // BELOW - ONLY FOR TESTING !!!
  // BELOW - ONLY FOR TESTING !!!
  // BELOW - ONLY FOR TESTING !!!
  // BELOW - ONLY FOR TESTING !!!
  // BELOW - ONLY FOR TESTING !!!
  // BELOW - ONLY FOR TESTING !!!

  function setTime(
    uint256 _startTime, 
    uint256 _endTime
  ) external {
    START_TIME = _startTime;
    END_TIME = _endTime;
  }

}
