pragma solidity 0.5.2;
pragma experimental ABIEncoderV2;

//import "github.com/oraclize/ethereum-api/oraclizeAPI.sol";
import "./oraclizeAPI_mock.sol";
import "./LotteryWhitelist.sol";
import "./Ownable.sol";


contract iLotteries {
    function processRound(uint round, uint randomNumber) public payable returns (bool);
    function getPeriod() public view returns (uint);
}

contract iRandao {
    function newCampaign(
        uint32 _bnum,
        uint96 _deposit,
        uint16 _commitBalkline,
        uint16 _commitDeadline
    )
        public payable returns (uint256 _campaignID);
}

contract RNG is usingOraclize, Ownable, Whitelist {

    struct Request {
        address lottery;
        uint round;
    }
    
    mapping(bytes32 => Request) public requests; // requests from lottery to oraclize

    uint public callbackGas = 2000000;

    bool public useOraclize;

    address randao;

    event RequestIsSended(address lottery, uint round, bytes32 queryId);
    event CallbackIsNotCorrect(address lottery, bytes32  queryId);
    event Withdraw(address to, uint value);

    constructor(bool _useOraclize) public {
        useOraclize = _useOraclize;
        if (useOraclize) oraclize_setProof(proofType_Ledger);
    }

    function () external payable {

    }

    function __callback(bytes32 _queryId, string memory _result, bytes memory _proof) public {
        if (msg.sender != oraclize_cbAddress()) revert("");

        if (oraclize_randomDS_proofVerify__returnCode(_queryId, _result, _proof) != 0) {
            emit CallbackIsNotCorrect(address(requests[_queryId].lottery), _queryId);
        } else {
            iLotteries temp = iLotteries(requests[_queryId].lottery);

            assert(temp.processRound(requests[_queryId].round, uint(keccak256(abi.encodePacked(_result)))));
        }
    }

    function __callback(bytes32 _queryId, uint _result) public {
        if (msg.sender != randao) revert("");

        iLotteries temp = iLotteries(requests[_queryId].lottery);

        assert(temp.processRound(requests[_queryId].round, uint(keccak256(abi.encodePacked(_result)))));

    }
    
    function update(uint _roundNumber, uint _additionalNonce, uint _period) public payable {
        uint n = 32; // number of random bytes we want the datasource to return
        uint delay = 0; // number of seconds to wait before the execution takes place

        bytes32 queryId;
        if (!useOraclize) {
            queryId = bytes32(iRandao(randao).newCampaign.value(350 finney)(uint32(block.number+101), uint96(200 finney), uint16(100), uint16(50)));
        } else {
            queryId = custom_oraclize_newRandomDSQuery(_period, delay, n, callbackGas, _additionalNonce);
        }

        requests[queryId].lottery = msg.sender;
        requests[queryId].round = _roundNumber;

        emit RequestIsSended(msg.sender, _roundNumber, queryId);
    }
    
    function withdraw(address payable _to, uint256 _value) public onlyOwner {
        emit Withdraw(_to, _value);
        _to.transfer(_value);
    }

    function setCallbackGas(uint _callbackGas) public onlyOwner {
        callbackGas = _callbackGas;
    }

    function setUseOraclize(bool _useOraclize) public onlyOwner {
        useOraclize = _useOraclize;
    }

    function setRandao(address _randao) public onlyOwner {
        require(_randao != address(0));

        randao = _randao;
    }

    function getRequest(bytes32 _queryId) public view returns (address, uint) {
        return (requests[_queryId].lottery, requests[_queryId].round);
    }

    function getCallbackGas() public view returns (uint) {
        return callbackGas;
    }

    function custom_oraclize_newRandomDSQuery(
        uint _period,
        uint _delay,
        uint _nbytes,
        uint _customGasLimit,
        uint _additionalNonce
    )
        internal
        returns (bytes32)
    {
        require((_nbytes > 0) && (_nbytes <= 32), "");
        
        // Convert from seconds to ledger timer ticks
        _delay *= 10;
        bytes memory nbytes = new bytes(1);
        nbytes[0] = byte(uint8(_nbytes));
        bytes memory unonce = new bytes(32);
        bytes memory sessionKeyHash = new bytes(32);
        bytes32 sessionKeyHash_bytes32 = oraclize_randomDS_getSessionPubKeyHash();
        
        assembly {
            mstore(unonce, 0x20)
            mstore(add(unonce, 0x20), xor(blockhash(sub(number, 1)), xor(coinbase, xor(timestamp, _additionalNonce))))
            mstore(sessionKeyHash, 0x20)
            mstore(add(sessionKeyHash, 0x20), sessionKeyHash_bytes32)
        }
        
        bytes memory delay = new bytes(32);
        
        assembly {
            mstore(add(delay, 0x20), _delay)
        }

        bytes memory delay_bytes8 = new bytes(8);
        
        copyBytes(delay, 24, 8, delay_bytes8, 0);

        bytes[4] memory args = [unonce, nbytes, sessionKeyHash, delay];
        bytes32 queryId = oraclize_query(_period, "random", args, _customGasLimit);

        bytes memory delay_bytes8_left = new bytes(8);

        assembly {
            let x := mload(add(delay_bytes8, 0x20))
            mstore8(add(delay_bytes8_left, 0x27), div(x, 0x100000000000000000000000000000000000000000000000000000000000000))
            mstore8(add(delay_bytes8_left, 0x26), div(x, 0x1000000000000000000000000000000000000000000000000000000000000))
            mstore8(add(delay_bytes8_left, 0x25), div(x, 0x10000000000000000000000000000000000000000000000000000000000))
            mstore8(add(delay_bytes8_left, 0x24), div(x, 0x100000000000000000000000000000000000000000000000000000000))
            mstore8(add(delay_bytes8_left, 0x23), div(x, 0x1000000000000000000000000000000000000000000000000000000))
            mstore8(add(delay_bytes8_left, 0x22), div(x, 0x10000000000000000000000000000000000000000000000000000))
            mstore8(add(delay_bytes8_left, 0x21), div(x, 0x100000000000000000000000000000000000000000000000000))
            mstore8(add(delay_bytes8_left, 0x20), div(x, 0x1000000000000000000000000000000000000000000000000))

        }

        oraclize_randomDS_setCommitment(queryId, keccak256(abi.encodePacked(delay_bytes8_left, args[1], sha256(args[0]), args[2])));
        return queryId;
    }
}
