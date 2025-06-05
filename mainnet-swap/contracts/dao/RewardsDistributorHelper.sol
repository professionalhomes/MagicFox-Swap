// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.8.13;

import './libraries/Math.sol';
import './interfaces/IERC20.sol';
import './interfaces/IVotingEscrow.sol';
import "hardhat/console.sol";

interface IRD {
    function time_cursor_of(uint _tokenId) external view returns (uint);
    function user_epoch_of(uint _tokenId) external view returns (uint);
    function last_token_time() external view returns (uint);
    function start_time() external view returns (uint);
    function tokens_per_week(uint idx) external view returns (uint);
    function ve_supply(uint idx) external view returns (uint);
}

contract RewardsDistributorHelper {

    uint constant WEEK = 7 * 86400;

    function claimable(address rd, uint _tokenId, address ve, uint _last_token_time) public view returns (uint) {
        uint user_epoch = 0;
        uint to_distribute = 0;

        uint max_user_epoch = IVotingEscrow(ve).user_point_epoch(_tokenId);
        uint _start_time = IRD(rd).start_time();

        if (max_user_epoch == 0) return 0;

        uint week_cursor = IRD(rd).time_cursor_of(_tokenId);
        if (week_cursor == 0) {
            user_epoch = _find_timestamp_user_epoch(ve, _tokenId, _start_time, max_user_epoch);
        } else {
            user_epoch = IRD(rd).user_epoch_of(_tokenId);
        }

        if (user_epoch == 0) user_epoch = 1;

        IVotingEscrow.Point memory user_point = IVotingEscrow(ve).user_point_history(_tokenId, user_epoch);

        if (week_cursor == 0) week_cursor = (user_point.ts + WEEK - 1) / WEEK * WEEK;
        if (week_cursor >= IRD(rd).last_token_time()) return 0;
        if (week_cursor < _start_time) week_cursor = _start_time;

        IVotingEscrow.Point memory old_user_point;

        for (uint i = 0; i < 50; i++) {
            if (week_cursor >= _last_token_time) break;

            if (week_cursor >= user_point.ts && user_epoch <= max_user_epoch) {
                user_epoch += 1;
                old_user_point = user_point;
                if (user_epoch > max_user_epoch) {
                    user_point = IVotingEscrow.Point(0,0,0,0);
                } else {
                    user_point = IVotingEscrow(ve).user_point_history(_tokenId, user_epoch);
                }
            } else {
                int128 dt = int128(int256(week_cursor - old_user_point.ts));
                uint balance_of = Math.max(uint(int256(old_user_point.bias - dt * old_user_point.slope)), 0);
                if (balance_of == 0 && user_epoch > max_user_epoch) break;
                if (balance_of != 0) {
                    to_distribute += balance_of * IRD(rd).tokens_per_week(week_cursor) / IRD(rd).ve_supply(week_cursor);
                }
                week_cursor += WEEK;
            }
        }

        return to_distribute;
    }

    function claimableNow(address rd, uint _tokenId, address ve) external view returns (uint) {
        uint _last_token_time = IRD(rd).last_token_time() / WEEK * WEEK;
        return claimable(rd, _tokenId, ve, _last_token_time);
    }

    function claimableNextEpoch(address rd, uint _tokenId, address ve) external view returns (uint) {
        uint _last_token_time = IRD(rd).last_token_time() / WEEK * WEEK + WEEK;
        return claimable(rd, _tokenId, ve, _last_token_time);
    }

    function _find_timestamp_user_epoch(address ve, uint tokenId, uint _timestamp, uint max_user_epoch) internal view returns (uint) {
        uint _min = 0;
        uint _max = max_user_epoch;
        for (uint i = 0; i < 128; i++) {
            if (_min >= _max) break;
            uint _mid = (_min + _max + 2) / 2;
            IVotingEscrow.Point memory pt = IVotingEscrow(ve).user_point_history(tokenId, _mid);
            if (pt.ts <= _timestamp) {
                _min = _mid;
            } else {
                _max = _mid -1;
            }
        }
        return _min;
    }
}
