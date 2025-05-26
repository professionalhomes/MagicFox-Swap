// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../lz/interfaces/ILayerZeroEndpoint.sol";
import "../lz/interfaces/ILayerZeroReceiver.sol";

contract VotingEscrowMirror is Ownable, ILayerZeroReceiver {
    // TODO add lzEndpoint
    ILayerZeroEndpoint public constant lzEndpoint = ILayerZeroEndpoint(address(0));
    uint256 public lzGasLimit = 200_000;

    struct Token {
        address owner;
        uint balance;
        uint attachments;
        uint counter;
    }

    address public immutable token;
    address public voter;
    address public team;
    address public mainchainAddress;
    uint16 public mainchainId = 102; // LayerZero BSC chainId
    mapping(address => bool) public whitelistedMirrors;

    uint256 public _totalSupply;
    mapping(uint => Token) public tokens;
    mapping(address => uint[]) internal ownerToNFTokenIdList;

    constructor(address _token_addr, address _mainchainAddress) {
        token = _token_addr;
        voter = msg.sender;
        team = msg.sender;
        mainchainAddress = _mainchainAddress;
    }

    function ownerOf(uint _tokenId) public view returns (address) {
        return tokens[_tokenId].owner;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOfNFT(uint _tokenId) external view returns (uint) {
        return tokens[_tokenId].balance;
    }

    function tokenOfOwnerByIndex(address _owner, uint _tokenIndex) external view returns (uint) {
        return ownerToNFTokenIdList[_owner][_tokenIndex];
    }

    function attach(uint _tokenId) external {
        require(msg.sender == voter);
        tokens[_tokenId].attachments += 1;
    }

    function detach(uint _tokenId) external {
        require(msg.sender == voter);
        tokens[_tokenId].attachments -= 1;
    }

    // TODO: Should be internal, public for testing
    function mirrorToken(address _owner, uint _tokenId, uint _balance, uint _counter, uint __totalSupply) public {
        // only whitelisted address can mirror locks
        require(whitelistedMirrors[msg.sender] == true);
        tokens[_tokenId] = Token(_owner, _balance, tokens[_tokenId].attachments, _counter);
        if (_counter == 1) {
            ownerToNFTokenIdList[_owner].push(_tokenId);
        }
        _totalSupply = __totalSupply;
    }

    function clearMirror(uint _tokenId) external payable {
        require(msg.sender == tokens[_tokenId].owner);
        require(tokens[_tokenId].attachments == 0);

        bytes memory lzPayload = abi.encode(_tokenId, tokens[_tokenId].counter);
        bytes memory trustedPath = abi.encodePacked(mainchainAddress, address(this));
        bytes memory adapterParams = abi.encodePacked(uint16(1), lzGasLimit);

        lzEndpoint.send{value: msg.value}(mainchainId, trustedPath, lzPayload, payable(msg.sender), address(0), adapterParams);

        delete tokens[_tokenId];
        for (uint i=0; i < ownerToNFTokenIdList[msg.sender].length; i++) {
            if (_tokenId == ownerToNFTokenIdList[msg.sender][i]) {
                delete ownerToNFTokenIdList[msg.sender][i];
                break;
            }
        }
    }

    function lzReceive(uint16 _srcChainId, bytes memory _srcAddress, uint64 _nonce, bytes memory _payload) override external {
        // lzReceive must be called by the endpoint for security
        require(msg.sender == address(lzEndpoint), "LzApp: invalid endpoint caller");

        address srcAddressUA;
        assembly {
            srcAddressUA := mload(add(_srcAddress, 20))
        }
        require(srcAddressUA == mainchainAddress, "Unauthorized");

        (
            address _owner, 
            uint256 _tokenId,
            uint256 _balance,
            uint256 _counter,
            uint256 _totalSupply 
        ) = abi.decode(_payload, (address, uint256, uint256, uint256, uint256));
        mirrorToken(_owner, _tokenId, _balance, _counter, _totalSupply);
    }

    function setLzGasLimit(uint256 _lzGasLimit) external {
        require(msg.sender == team);
        lzGasLimit = _lzGasLimit;
    }

    function addWhitelistedMirror(address _mirror) external {
        require(msg.sender == team);
        whitelistedMirrors[_mirror] = true;
    }

    function removeWhitelistedMirror(address _mirror) external {
        require(msg.sender == team);
        whitelistedMirrors[_mirror] = false;
    }

    function setVoter(address _voter) external {
        require(msg.sender == team);
        voter = _voter;
    }
}