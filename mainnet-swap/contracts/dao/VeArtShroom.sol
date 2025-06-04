// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {Base64} from "./libraries/Base64.sol";
import {IVeArtProxy} from "./interfaces/IVeArtProxy.sol";

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract VeArtShroom is IVeArtProxy, OwnableUpgradeable {

    struct DateTime {
      uint16 year;
      uint8 month;
      uint8 day;
    }

    uint constant DAY_IN_SECONDS = 86400;
    uint constant YEAR_IN_SECONDS = 31536000;
    uint constant LEAP_YEAR_IN_SECONDS = 31622400;
    uint16 constant ORIGIN_YEAR = 1970;
    uint constant base = 1 ether;
    uint constant round = 10000000000000000;

    constructor() {}

    function initialize() initializer public {
        __Ownable_init();
    }

    function toString(uint value) internal pure returns (string memory) {
        // Inspired by OraclizeAPI's implementation - MIT license
        // https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

        if (value == 0) {
            return "0";
        }
        uint temp = value;
        uint digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function _tokenURI(uint _tokenId, uint _balanceOf, uint _locked_end, uint _value) external pure returns (string memory output) {
      DateTime memory date = parseTimestamp(_locked_end);
      output = '<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 350"><path fill="#000" d="M0 0H350V350H0z"/><path d="M30.3 266.3H37l12.3 33 12.3-33h6.6L51.8 309h-5.2l-16.3-42.7Zm-3 0h6.3l1 28.5V309h-7.3v-42.7Zm37.5 0h6.3V309h-7.3v-14.2l1-28.5ZM97 272l-12.8 37h-7.7l16-42.7h5L97 272Zm10.6 37L95 272l-.6-5.7h5l16 42.7h-7.7Zm-.6-15.8v5.8H83.8v-5.8H107Zm45.4-6v16.3c-.6.8-1.5 1.7-2.8 2.6-1.3 1-3 1.8-5 2.5a26 26 0 0 1-15.3-.4c-2.2-.9-4.2-2.2-5.8-4a18.4 18.4 0 0 1-3.7-6.4c-.9-2.5-1.3-5.4-1.3-8.7v-3c0-3.1.4-6 1.2-8.5.8-2.6 2-4.7 3.5-6.5 1.5-1.7 3.4-3 5.5-4 2.2-.9 4.6-1.3 7.4-1.3 3.5 0 6.3.5 8.6 1.7s4.1 2.8 5.4 4.8c1.2 2 2 4.4 2.3 7h-7.2c-.2-1.4-.7-2.8-1.3-4a7 7 0 0 0-3-2.7c-1.2-.7-2.8-1-4.7-1-1.7 0-3.2.3-4.5 1a8.5 8.5 0 0 0-3.2 2.8 14 14 0 0 0-2 4.6c-.4 1.8-.6 3.8-.6 6.1v3c0 2.4.3 4.5.8 6.3.5 1.8 1.2 3.3 2.1 4.6 1 1.2 2.1 2.2 3.5 2.8 1.4.6 3 1 4.6 1 1.7 0 3-.2 4.2-.5a7.9 7.9 0 0 0 4-2.2v-8.4h-8.9v-5.5h16.2Zm16-20.9V309h-7.3v-42.7h7.3Zm34.4 28.8h7.3a17 17 0 0 1-2.4 7.5 14 14 0 0 1-5.5 5.1 18.8 18.8 0 0 1-8.8 1.9 15.6 15.6 0 0 1-12.5-5.4 18.3 18.3 0 0 1-3.5-6.4c-.8-2.5-1.2-5.3-1.2-8.3v-3.6c0-3 .4-5.8 1.2-8.3.8-2.5 2-4.6 3.5-6.4 1.6-1.7 3.4-3.1 5.5-4a18 18 0 0 1 7.3-1.4c3.4 0 6.2.6 8.6 1.8 2.3 1.3 4.1 3 5.4 5.2 1.3 2.2 2.1 4.8 2.4 7.6h-7.3c-.2-1.8-.6-3.4-1.3-4.7a6.7 6.7 0 0 0-2.9-3c-1.2-.7-2.9-1-5-1a8.3 8.3 0 0 0-7.5 3.7c-.8 1.1-1.5 2.6-1.9 4.4-.4 1.8-.6 3.8-.6 6v3.7c0 2.1.2 4 .6 5.8.4 1.8 1 3.3 1.7 4.5a8.5 8.5 0 0 0 3 2.9 9 9 0 0 0 4.5 1c2 0 3.8-.3 5-1a6.6 6.6 0 0 0 3-2.9c.7-1.3 1.2-2.8 1.4-4.7Zm18.7-28.8V309h-3.6v-42.7h3.6Zm19.8 19.7v3h-21v-3h21Zm3-19.7v3.1h-24v-3h24Zm38.8 19v4.7c0 3-.4 5.6-1.2 8-.7 2.5-1.8 4.5-3.3 6.3-1.5 1.7-3.2 3-5.2 4-2 .8-4.3 1.3-6.9 1.3-2.5 0-4.7-.5-6.8-1.4-2-1-3.8-2.2-5.2-4a18.4 18.4 0 0 1-3.4-6.1c-.8-2.5-1.2-5.2-1.2-8.1v-4.6c0-3 .4-5.7 1.1-8.1.8-2.4 2-4.5 3.4-6.2 1.5-1.7 3.3-3 5.3-4 2-.9 4.3-1.3 6.8-1.3s4.8.4 6.8 1.3c2 1 3.8 2.3 5.3 4a18 18 0 0 1 3.3 6.2 26 26 0 0 1 1.2 8Zm-3.6 4.7v-4.7c0-2.5-.3-4.8-.9-6.8-.5-2-1.4-3.7-2.5-5.1a11.2 11.2 0 0 0-4.1-3.3c-1.6-.8-3.5-1.1-5.5-1.1s-3.9.3-5.5 1c-1.6.9-3 2-4 3.4-1.2 1.4-2 3.1-2.6 5.1-.6 2-1 4.3-1 6.8v4.7c0 2.5.4 4.8 1 6.8s1.4 3.8 2.6 5.2a11.5 11.5 0 0 0 9.5 4.4 11.2 11.2 0 0 0 9.6-4.4c1.1-1.4 2-3.2 2.5-5.2.6-2 1-4.3 1-6.8Zm13-23.7 12 18 12-18h4.3l-14 21 14.5 21.7H317l-12.5-18.6-12.4 18.6h-4.3l14.5-21.6-14-21h4.2Z" fill="#fff" fill-opacity=".9" opacity=".7"/><g opacity=".5"><path d="M128.8 179.2c0-3.2 1.5-6.3 3.2-9a69 69 0 0 1 5-6.6c6.3-7.5 9.6-9 17.6-14.7 3.8-2.7 8-4.9 12.3-6.6a37 37 0 0 1 20.4-1.5c4.2 1.5 10.8 6 17.8 13.7 4.4 4.8 7.6 9 13.3 18.8 4.5 7.4 3.8 16.7-2.7 20.2-8.3 5.8-19.2 4.8-29 5.4-3.5-.8.3 10 .8 14.4.1 1.7.8 3.3 1.8 4.6.8 1 1.6 2 1.8 3.3.3 3 2.5 5 2.9 8 .2 2.2.6 4.3.9 6.4a9 9 0 0 1-8.7 10c-.8 0-1.7 0-2.5-.2-1.4-.3-2.1.2-4.9.9-2 .5-4.2.7-6.3.8-11 .1-14.2-2.1-16.5-3-5.4-2.6-5.3-9-2.9-13.7.5-1 1.2-2 2-2.8 3-3.7 5.3-7.9 6.8-12.4 2-6.5 1.9-10.9 1.2-15.3-1-.6-2.5-.1-3.6-.6-12-1.9-29.3-5.5-30.7-20.1Z" fill="#fff"/><path d="M131.7 175.5c5.2-13.9 23.9-25.1 28.9-28 5.1-2.8 8.5-4.8 17.5-5.1 5-.2 10 1.1 14.1 3.9a81.9 81.9 0 0 1 26.4 33.5c2 17.7-21.9 15.3-33.6 16-2.2-.6.5-3.8.7-5.2 1-8.4-11.1-7.4-16.7-6.6-14.8 5.2-2.2 12.2-6 12.4-11.3.3-36.7-6.4-31.3-21Zm26 8c-3-3.9-8.4-3.6-12.8-4.2a.7.7 0 0 1-.4-1.1c1.5-1.7 6.4-1.3 9.3-.8a9 9 0 0 1 2.5.8c1.8.9 3.8 1.5 5.4 2.9.6.4 4.2 4.4 3 1.6a11.8 11.8 0 0 0-7-5.2c-.6 0-1.5-.2-1.8-.8-.1-.2 0-.4.2-.6 1.2-.8 3.4-.6 4.8-.1 2.5.2 3.8 1.8 5.3 3.7 1.3 1 1.1 3.7 3.3 2.4-1.4-1.2-2-3-2.6-4.8-.1-.4-.8-.9-.3-1.2 2.7-1 5.8-.2 5.2 3.2 1.2 3.8 1.6-.4 1-2-.3-1.3.4-1.5 1.6-1.3h3.1c3.5.2-3.2 4.8.1 4.8 2.6-6.6 10-2.5 4.9-1.4-2.7.6-2.8 4.5 0 1.4 1.7-.7 3.4-2.5 5-2.4 1 .2 3.9 1 2.3 2.1-1.5.9-4.6 1.6-5.1 3.2 2.4-.8 4.9-2.2 7.6-2.5 2.7-.3 7.9-1.2 10.4.5.7.4 0 1-.4 1-2.5-.3-9.7-.8-12.3 2.3 6-2 11.4-1.3 17.6-.6 1 .4 2.9 0 3 1.3.5 1.7-.6 3.3-2.4 2.8-5.4-2.6-13.3-4.8-18.6-1h7.1l5.7.3c3 .5 8.2 3.7 1.8 3.5-4 .1-10.3-3.6-15-1.7 1.4 1 8.1.7 7.5 2.4-.4 1.4-7 0-9.6 1.8 1.1.5 2.3.5 3.7.5 4 0 28.8-3.2 22-9.8-6.3-4.4-14.4-4.2-21.4-6.6-4-1.3-8.8-.8-12-3.5-2-1.5-4.3 1.3-6.4.4-14.7-2-59.8 3.7-22.7 17.5 1.2 0 13 4.1 10 1-4.4-1.7-3.5-1-1-2.9-2.4-.4-4.6 1-6.8.6-.5 0-.6-.7-.2-1 2-1.2 5.5-1 6.4-2a8.6 8.6 0 0 0-8.7 1.2c-.6.4-1.4.6-2 .3l-2.5-1a.9.9 0 0 1 0-1.5 17 17 0 0 1 9.4-1.4c6.3 1.7-1.2-2.7-4.5-2l-1.2.3c-3 .4-5.7 1.7-8.6 1.7-1.5-.2-2.5-2.8-1.2-3.9 1.2-2 3.6-.7 5.4-.7 4.6-.8 8.9 0 13 2.5Zm14.1-15c3.4 0 9.8-6.2 9.2-9.7-.6-5.7-8-3.8-9.8 0-.7 1.3-.8 2.9-2 3.7-4.5 2.2-.8 6.2 2.6 6Zm-21.2-.6c4-.1 7.8-1.5 10.1-4.9 1-2-1.5-3.8-3-4.6-2.9-1.1-5.5 1-8 2-3.3 1.8-4.4 7.7.9 7.5Zm52.5.5c-.4-2.7-1.8-6.8-5-6.8-2.1-.3-6.2-1.4-6.3 2 .7 2.3 2.8 5.5 5.3 6.3 2 0 5.8 1.7 6-1.5Zm-13.3-16.9c.4-3.3-3.3-4.9-6.1-4.2-5 2.6 5.5 12.2 6.1 4.2Zm-20.1-.2c4 .2 6.3-4.8 1.7-5.8-4.5-1-8.4 5-1.7 5.8Z" fill="url(#a)"/><path d="M193 235.3c-.4-1.7-.6-3.6-1.3-5v-.1c-.7-1.5-2.3-7-2.3-7-.5-4.3-4.9-6.8-4.5-11.4-.4-5-2.6-9.6-1.9-14.7-.2-6.5 3.8-6.5-1.1-10.4-5.6-2.8-15.3-3.6-18.5 2.7-.7 2.7 1.7 4.6 2 7a45.2 45.2 0 0 1-3.5 24.5c-1.8 3.7-5.7 8.3-5.7 8.3-2.5 3.5-3.8 9.7.8 11.9l.4.2c1 .3 2 1 3 1.6.4.3 1.3.6 2.5 1a27.5 27.5 0 0 0 16.4-.6c2.2-.7 4-1.1 5.7-.7.8.2 1.5.2 2.2.2a6.2 6.2 0 0 0 5.9-7l-.1-.5Z" fill="url(#b)"/><path fill-rule="evenodd" clip-rule="evenodd" d="M124.3 212.2c-.4.2-.4.7 0 .9l6.8 3.2.2.3 3.3 6.8c.2.3.7.3.8 0l3.3-6.8.2-.3 7-3.2c.3-.2.3-.7 0-.9l-7-3.2-.2-.3-3.3-6.8a.5.5 0 0 0-.8 0l-3.3 6.8c0 .1 0 .2-.2.3l-6.8 3.2ZM201.5 212.2c-.4.2-.4.7 0 .8l7.9 3.8.2.2 3.7 8c.2.3.7.3.8 0l3.8-8 .2-.2 7.9-3.8c.3-.1.3-.6 0-.8l-7.9-3.8s-.2 0-.2-.2l-3.8-7.9a.5.5 0 0 0-.8 0l-3.7 8-.2.1-8 3.8ZM135.8 231c-.4.1-.4.6 0 .8l4 2 .3.1 2 4.2c.2.3.6.3.8 0l2-4.2.2-.2 4.1-2c.3-.1.3-.6 0-.8l-4.1-2-.2-.1-2-4.2a.5.5 0 0 0-.8 0l-2 4.2-.2.2-4.1 2ZM198.1 232.5c-.3.2-.3.7 0 .8l4 1.9.2.2 1.9 3.8c.2.3.6.3.8 0l1.9-3.8.2-.2 4-1.9c.3-.1.3-.6 0-.8l-4-1.8-.2-.2-2-3.9a.5.5 0 0 0-.7 0l-2 3.9-.1.2-4 1.8Z" fill="#fff"/></g><defs><linearGradient id="a" x1="175.1" y1="140" x2="175.1" y2="247.1" gradientUnits="userSpaceOnUse"><stop stop-color="#C2C0E1"/><stop offset=".4" stop-color="#7000FF"/><stop offset="1" stop-color="#35264A"/></linearGradient><linearGradient id="b" x1="175.1" y1="140" x2="175.1" y2="247.1" gradientUnits="userSpaceOnUse"><stop stop-color="#C2C0E1"/><stop offset=".4" stop-color="#7000FF"/><stop offset="1" stop-color="#35264A"/></linearGradient></defs><style>.prefix__base{fill:#fff;font-family:sans-serif;font-size:24px}</style><text x="10" y="30" class="prefix__base">';
      output = string(abi.encodePacked(output, "ID: ", toString(_tokenId), '</text><text x="10" y="60" class="prefix__base">'));
      output = string(abi.encodePacked(output, "Balance: ", toAmount(_balanceOf), '</text><text x="10" y="90" class="prefix__base">'));
      output = string(abi.encodePacked(output, "End date: ", toString(date.day), '/', toString(date.month), '/', toString(date.year), '</text><text x="10" y="120" class="prefix__base">'));
      output = string(abi.encodePacked(output, "Value: ", toAmount(_value), '</text></svg>'));

      string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name": "lock #', toString(_tokenId), '", "description": "MagicFox locks, can be used to boost gauge yields, vote on token emission, and receive bribes", "image": "data:image/svg+xml;base64,', Base64.encode(bytes(output)), '"}'))));
      output = string(abi.encodePacked('data:application/json;base64,', json));
    }

    function toAmount(uint256 balance) internal pure returns (string memory) {
      uint256 main = balance / base;
      uint256 remainder = balance % base;
      if (remainder == 0) {
        return toString(main);
      } else {
        uint256 rounded = divisionRoundUp(remainder, round);
        return string(abi.encodePacked(toString(main), '.', toString(rounded)));
      }
    }

    function divisionRoundUp(uint256 x, uint256 y) internal pure returns (uint256 z) {
      z = ((x + (y / 2)) / y);
    }

    function isLeapYear(uint16 year) internal pure returns (bool) {
      if (year % 4 != 0) {
        return false;
      }
      if (year % 100 != 0) {
        return true;
      }
      if (year % 400 != 0) {
        return false;
      }
      return true;
    }

    function parseTimestamp(uint timestamp) internal pure returns (DateTime memory dt) {
      uint secondsAccountedFor = 0;
      uint buf;
      uint8 i;

      dt.year = ORIGIN_YEAR;

      // Year
      while (true) {
        if (isLeapYear(dt.year)) {
          buf = LEAP_YEAR_IN_SECONDS;
        }
        else {
          buf = YEAR_IN_SECONDS;
        }

        if (secondsAccountedFor + buf > timestamp) {
          break;
        }
        dt.year += 1;
        secondsAccountedFor += buf;
      }

      // Month
      uint8[12] memory monthDayCounts;
      monthDayCounts[0] = 31;
      if (isLeapYear(dt.year)) {
        monthDayCounts[1] = 29;
      }
      else {
        monthDayCounts[1] = 28;
      }
      monthDayCounts[2] = 31;
      monthDayCounts[3] = 30;
      monthDayCounts[4] = 31;
      monthDayCounts[5] = 30;
      monthDayCounts[6] = 31;
      monthDayCounts[7] = 31;
      monthDayCounts[8] = 30;
      monthDayCounts[9] = 31;
      monthDayCounts[10] = 30;
      monthDayCounts[11] = 31;

      uint secondsInMonth;
      for (i = 0; i < monthDayCounts.length; i++) {
        secondsInMonth = DAY_IN_SECONDS * monthDayCounts[i];
        if (secondsInMonth + secondsAccountedFor > timestamp) {
          dt.month = i + 1;
          break;
        }
        secondsAccountedFor += secondsInMonth;
      }

      // Day
      for (i = 0; i < monthDayCounts[dt.month - 1]; i++) {
        if (DAY_IN_SECONDS + secondsAccountedFor > timestamp) {
          dt.day = i + 1;
          break;
        }
        secondsAccountedFor += DAY_IN_SECONDS;
      }
    }
}

