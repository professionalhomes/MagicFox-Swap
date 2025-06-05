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
    function create_lock_for(uint _value, uint _lock_duration, address _to) external returns (uint);
    function locked(uint id) external view returns(LockedBalance memory);
}

contract LockWithBonus is Ownable, ReentrancyGuard {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IERC20 public immutable FOX; // FOX token contract
  IVotingEscrow public immutable VE_FOX; // veFOX token contract

  IERC20 public immutable SHROOM; // SHROOM token contract
  IVotingEscrow public immutable VE_SHROOM; // veSHROOM token contract

  address public immutable treasury; 
  uint8 public bonus = 30; // 30%
  uint internal constant WEEK = 1 weeks;

  bool public isPaused;

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

  function flipPause() external onlyOwner {
    isPaused = !isPaused;
  }

  /********************************************/
  /****************** EVENTS ******************/
  /********************************************/
  event BonusLock(address indexed user, uint256 amount);
  event BonusUpdated(uint256 bonus);

  /**
   * @dev Lock with bonus
   */
  function lockToExisting(bool isFox, uint256 veNftID, uint256 amount) external nonReentrant {
    require(!isPaused, "paused");
    require(amount > 0, "amount zero not allowed");
    require(veNftID > 0, "veNftID not set");

    IVotingEscrow VE_NFT = isFox ? VE_FOX : VE_SHROOM;
    IERC20 TOKEN = isFox ? FOX : SHROOM;

    IVotingEscrow.LockedBalance memory lockData = VE_NFT.locked(veNftID);

    uint unlock_time = block.timestamp + 356 days;
    require(lockData.end >= unlock_time, "Lock time to low for bonus");

    TOKEN.safeTransferFrom(msg.sender, address(this), amount);

    uint256 veTokenBonus = amount.mul(bonus).div(100);
    TOKEN.safeTransferFrom(treasury, address(this), veTokenBonus);
    amount = TOKEN.balanceOf(address(this));
    VE_NFT.deposit_for(veNftID, amount);

    emit BonusLock(msg.sender, amount);
  }

  function createNewLock(bool isFox, uint256 amount, uint256 duration) external nonReentrant {
    require(!isPaused, "paused");
    require(amount > 0, "amount zero not allowed");

    IVotingEscrow VE_NFT = isFox ? VE_FOX : VE_SHROOM;
    IERC20 TOKEN = isFox ? FOX : SHROOM;

    uint unlock_time = (block.timestamp + duration) / WEEK * WEEK; // Locktime is rounded down to weeks
    require(unlock_time > block.timestamp + 356 days, "Lock time to low for bonus");

    TOKEN.safeTransferFrom(msg.sender, address(this), amount);

    uint256 veTokenBonus = amount.mul(bonus).div(100);
    TOKEN.safeTransferFrom(treasury, address(this), veTokenBonus);
    amount = TOKEN.balanceOf(address(this));
    VE_NFT.create_lock_for(amount, duration, msg.sender);

    emit BonusLock(msg.sender, amount);
  }

  function setBonus(uint8 _bonus)
    external
    onlyOwner()
  {
    require(_bonus >= 0 && _bonus <= 100, "bonus can be in range 0 - 100");
    bonus = _bonus;
    emit BonusUpdated(bonus);
  }

}