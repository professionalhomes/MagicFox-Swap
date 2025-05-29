pragma solidity ^0.8.0;
pragma abicoder v2;

import "./lz/lzApp/NonblockingLzApp.sol";

interface IOFT {
    function mintWeeklyRewards(address _toAddress, uint _amount) external;
}

contract DummySender is NonblockingLzApp {
    bytes public constant PAYLOAD = "\x01\x02\x03\x04";
    uint public counter;
    // address[] public gauges;
    // uint[] public amounts;
    address public token = 0xFb30639BD7C540DD03B231baAB85c9B778ddB4a1;

    event Receive(address[] a, uint[] b);

    constructor(address _lzEndpoint) NonblockingLzApp(_lzEndpoint) {}

 
    function sendPayload(uint16 _dstChainId, bytes memory _payload) public payable {
        _lzSend(_dstChainId, _payload, payable(msg.sender), address(0x0), bytes(""), msg.value);
    }

    function _nonblockingLzReceive(uint16 _srcChainId, bytes memory _srcAddress, uint64 _nonce, bytes memory _payload) internal virtual override {
        // (, gauges, amounts) = abi.decode(_payload, (uint16, address[], uint[]));
        // (, , uint[] memory _amounts) = abi.decode(_payload, (uint16, address[], uint[]));
        (address[] memory a, uint256[] memory amounts) = abi.decode(_payload, (address[], uint256[]));

        uint256 amountToMint;
        for (uint256 i = 0; i < amounts.length; i++) {
            amountToMint += amounts[i];
        }

        IOFT(token).mintWeeklyRewards(0x1bb1C670dC4317751a39EDa11Dc50E1231583306, amountToMint);

        emit Receive(a,amounts);

        // (, bytes memory toAddressBytes, uint amount) = abi.decode(_payload, (uint16, bytes, uint));
        // address to = toAddressBytes.toAddress(0);
        // (, address[] memory _gauges, uint[] memory _amounts) = abi.decode(_payload, (uint16, address[], uint[]));

        // gauges = _gauges;
        // amounts = _amounts;

        // uint16 packetType;
        // assembly {
        //     packetType := mload(add(_payload, 32))
        // }

        // if (packetType == PT_SEND) {
        //     _sendAck(_srcChainId, _srcAddress, _nonce, _payload);
        // } else {
        //     revert("OFTCore: unknown packet type");
        // }
    }
}