// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

interface IVotingEscrow {
    struct LockedBalance {
        int128 amount;
        uint end;
    }
    function deposit_for(uint tokenId, uint value) external;
    function locked(uint id) external view returns(LockedBalance memory);
}

contract FairlaunchBonus is Ownable, ReentrancyGuard {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IERC20 public immutable FOX; // FOX token contract
  IVotingEscrow public immutable VE_FOX; // veFOX token contract

  IERC20 public immutable SHROOM; // SHROOM token contract
  IVotingEscrow public immutable VE_SHROOM; // veSHROOM token contract

  address public immutable treasury; 
  uint8 public bonus = 30; // 30%
  uint internal constant WEEK = 1 weeks;

  constructor(
    IERC20 foxToken, 
    IVotingEscrow veFoxToken, 
    IERC20 shroomToken, 
    IVotingEscrow veShroomToken, 
    address treasury_
  ) {
    require(treasury_ != address(0), "invalid treasury");

    FOX = foxToken;
    VE_FOX = veFoxToken;
    SHROOM = shroomToken;
    VE_SHROOM = veShroomToken;
    treasury = treasury_;

    // set max approval for veFOX/veSHROOM locking
    FOX.approve(address(VE_FOX), type(uint256).max);
    SHROOM.approve(address(VE_SHROOM), type(uint256).max);
  }

  /********************************************/
  /****************** EVENTS ******************/
  /********************************************/
  event BonusLock(address indexed user, uint256 veFoxAmount, uint256 veShroomAmount);

  /**
   * @dev Lock with bonus
   */
  function lockWithBonus(uint256 veFoxTokenId, uint256 veShroomTokenId) external nonReentrant {
    IVotingEscrow.LockedBalance memory foxBalance = VE_FOX.locked(veFoxTokenId);
    IVotingEscrow.LockedBalance memory shroomBalance = VE_SHROOM.locked(veShroomTokenId);

    uint unlock_time = (block.timestamp + 364 days) / WEEK * WEEK; // Locktime is rounded down to weeks
    require(foxBalance.end >= unlock_time, "Lock time to low for bonus");
    require(shroomBalance.end >= unlock_time, "Lock time to low for bonus");

    FOX.safeTransferFrom(msg.sender, address(this), FOX.balanceOf(msg.sender));
    SHROOM.safeTransferFrom(msg.sender, address(this), SHROOM.balanceOf(msg.sender));

    uint256 veFoxAmount = FOX.balanceOf(address(this));
    uint256 veShroomAmount = SHROOM.balanceOf(address(this)); 

    // send FOX and lock veFOX
    if(veFoxAmount > 0) {
      uint256 veFoxBonus = veFoxAmount.mul(bonus).div(100);
      FOX.safeTransferFrom(treasury, address(this), veFoxBonus);
      veFoxAmount = FOX.balanceOf(address(this));
      VE_FOX.deposit_for(veFoxTokenId, veFoxAmount);
    }

    // send SHROOM and lock veSHROOM
    if(veShroomAmount > 0) {
      uint256 veFoxBonus = veShroomAmount.mul(bonus).div(100);
      SHROOM.safeTransferFrom(treasury, address(this), veFoxBonus);
      veShroomAmount = SHROOM.balanceOf(address(this));
      VE_SHROOM.deposit_for(veShroomTokenId, veShroomAmount);
    }

    emit BonusLock(msg.sender, veFoxAmount, veShroomAmount);
  }
}