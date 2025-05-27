// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IRouter.sol";
import "./interfaces/IERC20.sol";
import "hardhat/console.sol";

pragma solidity 0.8.13;

contract Receiver is Ownable {

  IRouter public swap;

  mapping(address => IRouter.route[]) public routes;

  address public receiver;

  constructor(address _swap, address _receiver) {
    swap = IRouter(_swap);
    receiver = _receiver;
  }

  function setReceiver(address _receiver)
    external
    onlyOwner()
  {
    receiver = _receiver;
  }

  function setTokenMapping(address _token, IRouter.route[] calldata _routes)
    external
    onlyOwner()
  {
    delete routes[_token];
    for (uint8 i = 0; i < _routes.length; i++) {
      routes[_token].push(IRouter.route({from: _routes[i].from, to: _routes[i].to, stable: _routes[i].stable}));
    }
    if (_token != address(0)) {
      IERC20(_token).approve(address(swap), type(uint).max);
    }
  }

  function approveERC20(address _token, address _to, uint256 _amount)
    external
    onlyOwner()
  {
    IERC20(_token).approve(_to, _amount);
  }

  function swapTokens(address[] calldata _tokens)
    external
  {
    for (uint8 i = 0; i < _tokens.length; i++) {
      if (_tokens[i] != address(0)) {
        uint256 balance = IERC20(_tokens[i]).balanceOf(address(this));
        if (balance > 0){
          uint[] memory amounts = swap.getAmountsOut(balance, routes[_tokens[i]]);
          uint amountOutMin = amounts[amounts.length - 1];
          swap.swapExactTokensForTokens(balance, amountOutMin, routes[_tokens[i]], address(this), block.timestamp);
        }
      } else {
        uint256 balance = address(this).balance;
        if (balance > 0){
          uint[] memory amounts = swap.getAmountsOut(balance, routes[_tokens[i]]);
          uint amountOutMin = amounts[amounts.length - 1];
          swap.swapExactETHForTokens{value:balance}(amountOutMin, routes[_tokens[i]], address(this), block.timestamp);
        }
      }
    }
  }

  function withdraw(address _token) external {
    if (_token == address(0)) {
      (bool success, ) = receiver.call{value: address(this).balance}("");
      require(success, "receiver rejected transfer");
    } else {
      IERC20(_token).transfer(receiver, IERC20(_token).balanceOf(address(this)));
    }
  }

  function getRoutes(address _token)
    public
    view 
    returns (IRouter.route[] memory _routes)
  {
    _routes = routes[_token];
  }

  fallback() external payable {}

  receive() external payable {}
}