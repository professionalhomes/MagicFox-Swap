// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import './libraries/Math.sol';
import './interfaces/IBluechipChef.sol';
import './interfaces/IGauge.sol';
import './interfaces/IGaugeFactory.sol';
import './interfaces/IERC20.sol';
import './interfaces/IMinter.sol';
import './interfaces/IPair.sol';
import './interfaces/IPairFactory.sol';
import './interfaces/IVotingEscrow.sol';
import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract BluechipChef is IBluechipChef, Ownable, ReentrancyGuard {

    address public _ve; // the ve token that governs these contracts
    address public factory; // the PairFactory
    address internal base;
    address public gaugefactory;
    uint internal constant DURATION = 7 days; // rewards are released over 7 days
    address public minter;
    address public governor; // should be set to an IGovernor
    address public emergencyCouncil; // credibly neutral party similar to Curve's Emergency DAO
    address public fees_collector;
    uint internal constant VOTER_TOKEN_ID = 1;

    uint internal index;
    mapping(address => uint) internal supplyIndex;
    mapping(address => uint) public claimable;

    uint public totalWeight; // total voting weight

    address[] public pools; // all pools viable for incentives
    mapping(address => address) public gauges; // pool => gauge
    mapping(address => uint) public gaugesDistributionTimestmap;
    mapping(address => address) public poolForGauge; // gauge => pool
    mapping(address => uint256) public weights; // pool => weight
    mapping(uint => mapping(address => uint256)) public votes; // nft => pool => votes
    mapping(uint => address[]) public poolVote; // nft => pools
    mapping(uint => uint) public usedWeights;  // nft => total voting weight of user
    mapping(uint => uint) public lastVoted; // nft => timestamp of last vote, to ensure one vote per epoch
    mapping(address => bool) public isGauge;
    mapping(address => bool) public isWhitelisted;
    mapping(address => bool) public isAlive;

    event GaugeCreated(address indexed gauge, address creator, address fees_collector, address indexed pool);
    event GaugeKilled(address indexed gauge);
    event GaugeRevived(address indexed gauge);
    event Voted(address indexed voter, uint tokenId, uint256 weight);
    event Abstained(uint tokenId, uint256 weight);
    event Deposit(address indexed lp, address indexed gauge, uint tokenId, uint amount);
    event Withdraw(address indexed lp, address indexed gauge, uint tokenId, uint amount);
    event NotifyReward(address indexed sender, address indexed reward, uint amount);
    event DistributeReward(address indexed sender, address indexed gauge, uint amount);
    event Attach(address indexed owner, address indexed gauge, uint tokenId);
    event Detach(address indexed owner, address indexed gauge, uint tokenId);
    event Whitelisted(address indexed whitelister, address indexed token);

    constructor(address __ve, address _factory, address _gauges, address _fees_collector) {
        _ve = __ve;
        factory = _factory;
        base = IVotingEscrow(__ve).token();
        gaugefactory = _gauges;
        minter = msg.sender;
        governor = msg.sender;
        emergencyCouncil = msg.sender;
        fees_collector = _fees_collector;
    }      

    function _initialize(address[] memory _tokens, address _minter) external {
        require(msg.sender == minter || msg.sender == emergencyCouncil);
        for (uint i = 0; i < _tokens.length; i++) {
            _whitelist(_tokens[i]);
        }
        minter = _minter;
    }

    function setMinter(address _minter) external {
        require(msg.sender == emergencyCouncil);
        minter = _minter;
    }

    function setGovernor(address _governor) public {
        require(msg.sender == governor);
        governor = _governor;
    }

    function setEmergencyCouncil(address _council) public {
        require(msg.sender == emergencyCouncil);
        emergencyCouncil = _council;
    }

    function reset() external onlyOwner nonReentrant {
        //require((block.timestamp / DURATION) * DURATION > lastVoted[VOTER_TOKEN_ID], "TOKEN_ALREADY_VOTED_THIS_EPOCH");
        lastVoted[VOTER_TOKEN_ID] = block.timestamp;
        _reset();
    }

    function _reset() internal {
        address[] storage _poolVote = poolVote[VOTER_TOKEN_ID];
        uint _poolVoteCnt = _poolVote.length;
        uint256 _totalWeight = 0;

        for (uint i = 0; i < _poolVoteCnt; i ++) {
            address _pool = _poolVote[i];
            uint256 _votes = votes[VOTER_TOKEN_ID][_pool];

            if (_votes != 0) {
                _updateFor(gauges[_pool]);
                weights[_pool] -= _votes;
                votes[VOTER_TOKEN_ID][_pool] -= _votes;
                if (_votes > 0) {
                    _totalWeight += _votes;
                } else {
                    _totalWeight -= _votes;
                }
                emit Abstained(VOTER_TOKEN_ID, _votes);
            }
        }
        totalWeight -= uint256(_totalWeight);
        usedWeights[VOTER_TOKEN_ID] = 0;
        delete poolVote[VOTER_TOKEN_ID];
    }

    function poke() external onlyOwner nonReentrant {
        //require((block.timestamp / DURATION) * DURATION > lastVoted[VOTER_TOKEN_ID], "TOKEN_ALREADY_VOTED_THIS_EPOCH");
        address[] memory _poolVote = poolVote[VOTER_TOKEN_ID];
        uint _poolCnt = _poolVote.length;
        uint256[] memory _weights = new uint256[](_poolCnt);

        for (uint i = 0; i < _poolCnt; i ++) {
            _weights[i] = votes[VOTER_TOKEN_ID][_poolVote[i]];
        }

        _vote(_poolVote, _weights);
    }

    function _vote(address[] memory _poolVote, uint256[] memory _weights) internal {
        _reset();
        uint _poolCnt = _poolVote.length;
        uint256 _weight = 1 * 1e18;
        uint256 _totalVoteWeight = 0;
        uint256 _totalWeight = 0;
        uint256 _usedWeight = 0;

        for (uint i = 0; i < _poolCnt; i++) {
            _totalVoteWeight += _weights[i];
        }

        for (uint i = 0; i < _poolCnt; i++) {
            address _pool = _poolVote[i];
            address _gauge = gauges[_pool];

            if (isGauge[_gauge]) {
                uint256 _poolWeight = _weights[i] * _weight / _totalVoteWeight;
                require(votes[VOTER_TOKEN_ID][_pool] == 0);
                require(_poolWeight != 0);
                _updateFor(_gauge);

                poolVote[VOTER_TOKEN_ID].push(_pool);

                weights[_pool] += _poolWeight;
                votes[VOTER_TOKEN_ID][_pool] += _poolWeight;
                _usedWeight += _poolWeight;
                _totalWeight += _poolWeight;
                emit Voted(msg.sender, VOTER_TOKEN_ID, _poolWeight);
            }
        }
        
        totalWeight += uint256(_totalWeight);
        usedWeights[VOTER_TOKEN_ID] = uint256(_usedWeight);
    }


    function vote(address[] calldata _poolVote, uint256[] calldata _weights) external onlyOwner nonReentrant {
        //require((block.timestamp / DURATION) * DURATION > lastVoted[VOTER_TOKEN_ID], "TOKEN_ALREADY_VOTED_THIS_EPOCH");
        require(_poolVote.length == _weights.length);
        lastVoted[VOTER_TOKEN_ID] = block.timestamp;
        _vote(_poolVote, _weights);
    }

    function whitelist(address _token) public {
        require(msg.sender == governor);
        _whitelist(_token);
    }

    function _whitelist(address _token) internal {
        require(!isWhitelisted[_token]);
        isWhitelisted[_token] = true;
        emit Whitelisted(msg.sender, _token);
    }

    function createGauge(address _pool) external returns (address) {
        require(gauges[_pool] == address(0x0), "exists");
        bool isPair = IPairFactory(factory).isPair(_pool);
        address tokenA;
        address tokenB;

        if (isPair) {
            (tokenA, tokenB) = IPair(_pool).tokens();
        }

        if (msg.sender != governor) { // gov can create for any pool, even non-Thena pairs
            require(isPair, "!_pool");
            require(isWhitelisted[tokenA] && isWhitelisted[tokenB], "!whitelisted");
        }

        address _gauge = IGaugeFactory(gaugefactory).createGaugeV2(base, _ve, _pool, address(this), address(0), address(0), fees_collector, isPair);

        IERC20(base).approve(_gauge, type(uint).max);
        gauges[_pool] = _gauge;
        poolForGauge[_gauge] = _pool;
        isGauge[_gauge] = true;
        isAlive[_gauge] = true;
        _updateFor(_gauge);
        pools.push(_pool);
        emit GaugeCreated(_gauge, msg.sender, fees_collector, _pool);
        return _gauge;
    }

    function killGauge(address _gauge) external {
        require(msg.sender == emergencyCouncil, "not emergency council");
        require(isAlive[_gauge], "gauge already dead");
        isAlive[_gauge] = false;
        claimable[_gauge] = 0;
        emit GaugeKilled(_gauge);
    }

    function reviveGauge(address _gauge) external {
        require(msg.sender == emergencyCouncil, "not emergency council");
        require(!isAlive[_gauge], "gauge already alive");
        isAlive[_gauge] = true;
        emit GaugeRevived(_gauge);
    }

    function attachTokenToGauge(uint tokenId, address account) external {
        require(isGauge[msg.sender]);
        require(isAlive[msg.sender]); // killed gauges cannot attach tokens to themselves
        if (tokenId > 0) IVotingEscrow(_ve).attach(tokenId);
        emit Attach(account, msg.sender, tokenId);
    }

    function emitDeposit(uint tokenId, address account, uint amount) external {
        require(isGauge[msg.sender]);
        require(isAlive[msg.sender]);
        emit Deposit(account, msg.sender, tokenId, amount);
    }

    function detachTokenFromGauge(uint tokenId, address account) external {
        require(isGauge[msg.sender]);
        if (tokenId > 0) IVotingEscrow(_ve).detach(tokenId);
        emit Detach(account, msg.sender, tokenId);
    }

    function emitWithdraw(uint tokenId, address account, uint amount) external {
        require(isGauge[msg.sender]);
        emit Withdraw(account, msg.sender, tokenId, amount);
    }

    function length() external view returns (uint) {
        return pools.length;
    }

    function poolVoteLength(uint tokenId) external view returns(uint) { 
        return poolVote[tokenId].length;
    }


    function notifyRewardAmount(uint amount) external {
        _safeTransferFrom(base, msg.sender, address(this), amount); // transfer the distro in
        uint256 _ratio = amount * 1e18 / totalWeight; // 1e18 adjustment is removed during claim
        if (_ratio > 0) {
            index += _ratio;
        }
        emit NotifyReward(msg.sender, base, amount);
    }

    function updateFor(address[] memory _gauges) external {
        for (uint i = 0; i < _gauges.length; i++) {
            _updateFor(_gauges[i]);
        }
    }

    function updateForRange(uint start, uint end) public {
        for (uint i = start; i < end; i++) {
            _updateFor(gauges[pools[i]]);
        }
    }

    function updateAll() external {
        updateForRange(0, pools.length);
    }

    function updateGauge(address _gauge) external {
        _updateFor(_gauge);
    }

    function _updateFor(address _gauge) internal {
        address _pool = poolForGauge[_gauge];
        uint256 _supplied = weights[_pool];
        if (_supplied > 0) {
            uint _supplyIndex = supplyIndex[_gauge];
            uint _index = index; // get global index0 for accumulated distro
            supplyIndex[_gauge] = _index; // update _gauge current position to global position
            uint _delta = _index - _supplyIndex; // see if there is any difference that need to be accrued
            if (_delta > 0) {
                uint _share = uint(_supplied) * _delta / 1e18; // add accrued difference for each supplied token
                if (isAlive[_gauge]) {
                    claimable[_gauge] += _share;
                }
            }
        } else {
            supplyIndex[_gauge] = index; // new users are set to the default global state
        }
    }

    function claimRewards(address[] memory _gauges, address[][] memory _tokens) external {
        for (uint i = 0; i < _gauges.length; i++) {
            IGauge(_gauges[i]).getReward(msg.sender, _tokens[i]);
        }
    }

    function distributeFees(address[] memory _gauges) external {
        for (uint i = 0; i < _gauges.length; i++) {
            if (IGauge(_gauges[i]).isForPair()){
                IGauge(_gauges[i]).claimFees();
            }
        }
    }

    function distribute(address _gauge) public nonReentrant {
        IMinter(minter).update_period();
        _updateFor(_gauge); // should set claimable to 0 if killed
        uint _claimable = claimable[_gauge];
        
        uint lastTimestamp = gaugesDistributionTimestmap[_gauge];
        uint currentTimestamp = IMinter(minter).active_period();
        // distribute only if claimable is > 0 and currentEpoch != lastepoch
        if (_claimable > 0 && lastTimestamp < currentTimestamp) {
            claimable[_gauge] = 0;
            IGauge(_gauge).notifyRewardAmount(base, _claimable);
            gaugesDistributionTimestmap[_gauge] = currentTimestamp;
            emit DistributeReward(msg.sender, _gauge, _claimable);
        }
    }

    function distributeAll() external {
        distribute(0, pools.length);
    }

    function distribute(uint start, uint finish) public {
        for (uint x = start; x < finish; x++) {
            distribute(gauges[pools[x]]);
        }
    }

    function distribute(address[] memory _gauges) external {
        for (uint x = 0; x < _gauges.length; x++) {
            distribute(_gauges[x]);
        }
    }

    function _safeTransferFrom(address token, address from, address to, uint256 value) internal {
        require(token.code.length > 0);
        (bool success, bytes memory data) =
        token.call(abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))));
    }

    function setGaugeFactory(address _gaugeFactory) external {
        require(msg.sender == emergencyCouncil);
        gaugefactory = _gaugeFactory;
    }

    function setPairFactory(address _factory) external {
        require(msg.sender == emergencyCouncil);
        factory = _factory;
    }

    function killGaugeTotally(address _gauge) external {
        require(msg.sender == emergencyCouncil, "not emergency council");
        require(isAlive[_gauge], "gauge already dead");
        isAlive[_gauge] = false;
        claimable[_gauge] = 0;
        address _pool = poolForGauge[_gauge];
        gauges[_pool] = address(0);
        poolForGauge[_gauge] = address(0);
        isGauge[_gauge] = false;
        isAlive[_gauge] = false;
        claimable[_gauge] = 0;
        emit GaugeKilled(_gauge);
    }

    function whitelist(address[] memory _token) public {
        require(msg.sender == governor);
        uint256 i = 0;
        for(i = 0; i < _token.length; i++){
            _whitelist(_token[i]);
        }
    }

    function initGauges(address[] memory _gauges, address[] memory _pools) public {
        require(msg.sender == emergencyCouncil);
        uint256 i = 0;
        for(i; i < _pools.length; i++){
            address _pool = _pools[i];
            address _gauge = _gauges[i];

            IERC20(base).approve(_gauge, type(uint).max);
            gauges[_pool] = _gauge;
            poolForGauge[_gauge] = _pool;
            isGauge[_gauge] = true;
            isAlive[_gauge] = true;
            _updateFor(_gauge);
            pools.push(_pool);
            emit GaugeCreated(_gauge, msg.sender, fees_collector, _pool);
        }
    }

    function increaseGaugeApprovals(address _gauge) external {
        require(msg.sender == emergencyCouncil);
        require(isGauge[_gauge] = true);
        IERC20(base).approve(_gauge, 0);
        IERC20(base).approve(_gauge, type(uint).max);
    }
    
}
