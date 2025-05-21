// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IRouter.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IWETH.sol";
import "./interfaces/IPairFactory.sol";
import "./interfaces/IPair.sol";
import "./interfaces/IGauge.sol";
import "hardhat/console.sol";

contract MagicZap is ReentrancyGuard {
  using SafeERC20 for IERC20;

  IRouter public router;
  address public wnative;
  IPairFactory public factory;

  struct BalanceLocalVars {
    uint256 amount0;
    uint256 amount1;
    uint256 balanceBefore;
    uint256 amountA;
    uint256 amountB;
  }
  
  event Zap(address inputToken, uint256 inputAmount, IRouter.route pair);
  event ZapNative(uint256 inputAmount, IRouter.route pair);

  constructor(address _router) {
    router = IRouter(_router);
    factory = IPairFactory(router.factory());
    wnative = router.weth();
  }

  /// @dev The receive method is used as a fallback function in a contract
  /// and is called when ether is sent to a contract with no calldata.
  receive() external payable {
      require(msg.sender == wnative, "Zap: Only receive ether from wrapped");
  }

  function getMinAmounts(
    uint256 inputAmount,
    IRouter.route[] calldata path0,
    IRouter.route[] calldata path1,
    bool stable
  ) external view returns (uint256[2] memory minAmountsSwap, uint256[2] memory minAmountsLP) {
    require(path0.length > 0 || path1.length > 0, "Zap: Needs at least one path");

    uint256 inputAmountHalf = inputAmount / 2;

    uint256 minAmountSwap0 = inputAmountHalf;
    if (path0.length != 0) {
      uint256[] memory amountsOut0 = router.getAmountsOut(inputAmountHalf, path0);
      minAmountSwap0 = amountsOut0[amountsOut0.length - 1];
    }

    uint256 minAmountSwap1 = inputAmountHalf;
    if (path1.length != 0) {
        uint256[] memory amountsOut1 = router.getAmountsOut(inputAmountHalf, path1);
        minAmountSwap1 = amountsOut1[amountsOut1.length - 1];
    }

    address token0 = path0.length == 0 ? path1[0].to : path0[path0.length - 1].to;
    address token1 = path1.length == 0 ? path0[0].to : path1[path1.length - 1].to;

    (uint amountA, uint amountB,) = router.quoteAddLiquidity(token0, token1, stable, minAmountSwap0, minAmountSwap1);

    minAmountsSwap = [minAmountSwap0, minAmountSwap1];
    minAmountsLP = [amountA, amountB];
  }

  function zap(
    IERC20 inputToken,
    uint256 inputAmount,
    IRouter.route calldata pair, //[token0, token1, stable]
    IRouter.route[] calldata path0,
    IRouter.route[] calldata path1,
    uint256[] memory minAmounts, //[amountASwap, amountBSwap, amountALP, amountBLP]
   // address stake, //gouge address to auto stake or address(0) otherwise
    address to,
    uint256 deadline
  ) external nonReentrant {
    _zapInternal(
      inputToken,
      inputAmount,
      pair,
      path0,
      path1,
      minAmounts,
   //   stake,
      to,
      deadline
    );
  }

  function zapNative(
    IRouter.route calldata pair, //[token0, token1, stable]
    IRouter.route[] calldata path0,
    IRouter.route[] calldata path1,
    uint256[] memory minAmounts, //[amountASwap, amountBSwap, amountALP, amountBLP]
    address to,
    uint256 deadline
  ) external payable nonReentrant {
    _zapNativeInternal(pair, path0, path1, minAmounts, to, deadline);
  }

  function _zapInternal(
    IERC20 inputToken,
    uint256 inputAmount,
    IRouter.route calldata pair, //[token0, token1, stable]
    IRouter.route[] calldata path0,
    IRouter.route[] calldata path1,
    uint256[] memory minAmounts,  //[amountASwap, amountBSwap, amountALP, amountBLP]
    // address stake, // gauge address to auto stake or address(0) otherwise
    address to,
    uint256 deadline
  ) internal {
    uint256 balanceBefore = _getBalance(inputToken);
    inputToken.safeTransferFrom(msg.sender, address(this), inputAmount);
    inputAmount = _getBalance(inputToken) - balanceBefore;

    uint256 liquidity = _zapPrivate(
      inputToken,
      inputAmount,
      pair,
      path0,
      path1,
      minAmounts,
      to,
      deadline,
      false
    );
    emit Zap(address(inputToken), minAmounts[0], pair);

    // TODO: If autostake gauge
    // if (stake != address(0)) {
    //   IGauge(stake).deposit(liquidity, 0);
    // }
  }

  function _zapNativeInternal(
    IRouter.route calldata pair, //[token0, token1, stable]
    IRouter.route[] calldata path0,
    IRouter.route[] calldata path1,
    uint256[] memory minAmounts, //[amountASwap, amountBSwap, amountALP, amountBLP]
    address to,
    uint256 deadline
  ) internal {
    uint256 inputAmount = msg.value;
    IERC20 inputToken = IERC20(wnative);
    IWETH(wnative).deposit{value: inputAmount}();

    _zapPrivate(
      inputToken,
      inputAmount,
      pair,
      path0,
      path1,
      minAmounts,
      to,
      deadline,
      true
    );

    emit ZapNative(inputAmount, pair);
  }

  function _getBalance(IERC20 token) internal view returns (uint256 balance) {
    balance = token.balanceOf(address(this));
  }

  function _zapPrivate(
    IERC20 inputToken,
    uint256 inputAmount,
    IRouter.route calldata pair, //[token0, token1, stable]
    IRouter.route[] calldata path0,
    IRouter.route[] calldata path1,
    uint256[] memory minAmounts, //[amountASwap, amountBSwap, amountALP, amountBLP]
    address to,
    uint256 deadline,
    bool native
  ) private returns (uint256 liquidity) {
    require(to != address(0), "Zap: Can't zap to null address");
    require(
      factory.getPair(pair.from, pair.to, pair.stable) != address(0),
      "Zap: Pair doesn't exist"
    );

    BalanceLocalVars memory vars;

    inputToken.approve(address(router), inputAmount);

    vars.amount0 = inputAmount / 2;
    vars.balanceBefore = 0;
    if (pair.from != address(inputToken)) {
      require(path0[0].from == address(inputToken), "Zap: wrong path path0[0]");
      require(path0[path0.length - 1].to == pair.from, "Zap: wrong path path0[-1]");
      vars.balanceBefore = _getBalance(IERC20(pair.from));
      router.swapExactTokensForTokens(vars.amount0, minAmounts[0], path0, address(this), deadline);
      vars.amount0 = _getBalance(IERC20(pair.from)) - vars.balanceBefore;
    }

    vars.amount1 = inputAmount / 2;
    if (pair.to != address(inputToken)) {
      require(path1[0].from == address(inputToken), "Zap: wrong path path1[0]");
      require(path1[path1.length - 1].to == pair.to, "Zap: wrong path path1[-1]");
      vars.balanceBefore = _getBalance(IERC20(pair.to));
      router.swapExactTokensForTokens(vars.amount1, minAmounts[1], path1, address(this), deadline);
      vars.amount1 = _getBalance(IERC20(pair.to)) - vars.balanceBefore;
    }

    IERC20(pair.from).approve(address(router), vars.amount0);
    IERC20(pair.to).approve(address(router), vars.amount1);
    (vars.amountA, vars.amountB, liquidity) = router.addLiquidity(
        pair.from,
        pair.to,
        pair.stable,
        vars.amount0,
        vars.amount1,
        minAmounts[2],
        minAmounts[3],
        to,
        deadline
    );

    if (pair.from == wnative) {
      // Ensure WNATIVE is called last
      _transfer(pair.to, vars.amount1 - vars.amountB, native);
      _transfer(pair.from, vars.amount0 - vars.amountA, native);
    } else {
      _transfer(pair.from, vars.amount0 - vars.amountA, false);
      _transfer(pair.to, vars.amount1 - vars.amountB, false);
    }
  }

  function _transfer(address token, uint256 amount, bool native) internal {
    if (amount == 0) return;
    if (token == wnative && native) {
      IWETH(wnative).withdraw(amount);
      // 2600 COLD_ACCOUNT_ACCESS_COST plus 2300 transfer gas - 1
      // Intended to support transfers to contracts, but not allow for further code execution
      (bool success, ) = msg.sender.call{value: amount, gas: 4899}("");
      require(success, "native transfer error");
    } else {
      IERC20(token).safeTransfer(msg.sender, amount);
    }
  }
}