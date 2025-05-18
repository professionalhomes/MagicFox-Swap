pragma solidity ^0.8.0;
pragma abicoder v2;

import "./lz/lzApp/NonblockingLzApp.sol";

interface IOFT {
    function mintWeeklyRewards(address _toAddress, uint _amount) external;
}

contract DummyReceiver is NonblockingLzApp {
    bytes public constant PAYLOAD = "\x01\x02\x03\x04";
    uint public counter;
    // address[] public gauges;
    // uint[] public amounts;
    address public token = 0xFb30639BD7C540DD03B231baAB85c9B778ddB4a1;

    event Receive(address[] a, uint[] b);

    constructor(address _lzEndpoint) NonblockingLzApp(_lzEndpoint) {}

    // function _nonblockingLzReceive(uint16, bytes memory, uint64, bytes memory) internal override {
    //     counter += 1;
    // }

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

    // function testEncode(uint256[] memory a) public view returns (bytes memory) {
    //   //bytes memory aaa = abi.encode(a, b);

    //   return abi.encode(a);
    // }

    // function testEncode2() public view returns (bytes memory) {
    //   uint256[] memory a = new uint256[](3);
    //   a[0] = 1;
    //   a[1] = 2;
    //   a[2] = 3;

    //   return abi.encode(a);
    // }

    // function testEncode3() public view returns (bytes memory) {

    //   return abi.encode(encodeArray([1,2,3]));
    // }

    // function encodeArray(uint256[] memory x) public view returns (bytes memory) {

    //   return abi.encode(x);
    // }


    // function encodeAddresses(address[] memory addressesToEncode, uint[] memory uintToEncode) public pure returns (bytes memory) {
    //     return abi.encode(0, addressesToEncode, uintToEncode);
    // }
    

    // address[] public a;
    // uint[] public b;
    // function decodeAddresses(bytes memory encodedAddresses) external {
    //     (, address[] memory _gauges, uint[] memory _amounts) = abi.decode(encodedAddresses, (uint16, address[], uint[]));

    //     a = _gauges;
    //     b = _amounts;
    // }

    // function listValues() public view returns (address[] memory, uint[] memory) {
    //   return (a,b);
    // }

    function estimateFee(uint16 _dstChainId, bool _useZro, bytes calldata _adapterParams) public view returns (uint nativeFee, uint zroFee) {
        return lzEndpoint.estimateFees(_dstChainId, address(this), PAYLOAD, _useZro, _adapterParams);
    }

    // function incrementCounter(uint16 _dstChainId) public payable {
    //     _lzSend(_dstChainId, PAYLOAD, payable(msg.sender), address(0x0), bytes(""), msg.value);
    // }

    // function setOracle(uint16 dstChainId, address oracle) external onlyOwner {
    //     uint TYPE_ORACLE = 6;
    //     // set the Oracle
    //     lzEndpoint.setConfig(lzEndpoint.getSendVersion(address(this)), dstChainId, TYPE_ORACLE, abi.encode(oracle));
    // }

    // function getOracle(uint16 remoteChainId) external view returns (address _oracle) {
    //     bytes memory bytesOracle = lzEndpoint.getConfig(lzEndpoint.getSendVersion(address(this)), remoteChainId, address(this), 6);
    //     assembly {
    //         _oracle := mload(add(bytesOracle, 32))
    //     }
    // }
}