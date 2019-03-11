pragma solidity 0.5.2;
pragma experimental ABIEncoderV2;


contract usingOraclize {
    address payable public myOraclize;

    bytes32[] public testId;

    uint public oraclizePrice;
    uint public verify;
    byte constant public proofType_Ledger = 0x30;
    byte constant public proofType_TLSNotary = 0x10;
    byte constant public proofStorage_IPFS = 0x01;

    function setTestId(bytes32 _testId) public {
        testId.push(keccak256(abi.encodePacked(_testId)));
    }

    function getRequestsArray() public view returns (bytes32[] memory) {
        return testId;
    }

    function setVerify(uint _verify) public {
        verify = _verify;
    }

    function setMyOraclize(address payable _myOraclize) public {
        myOraclize = _myOraclize;
    }

    function oraclize_cbAddress() public view returns (address) {
        return myOraclize;
    }

    function oraclize_query(
        uint timestamp,
        string memory datasource,
        bytes[4] memory arg,
        uint data
    ) public payable returns (bytes32) {
        //require(msg.value >= 0.02 ether, "");
        myOraclize.transfer(0.02 ether);
        timestamp;
        datasource;
        arg;
        data;
        if (testId.length == 0) testId.push("testId");
        testId.push(keccak256(abi.encodePacked(testId[testId.length-1])));
        return testId[testId.length-1];
    }

    function oraclize_query(
        uint timestamp,
        string memory datasource,
        string memory arg,
        uint gasLimit
    ) public payable returns (bytes32) {
        //require(msg.value >= 0.02 ether, "");
        myOraclize.transfer(0.02 ether);
        timestamp;
        datasource;
        gasLimit;
        arg;
        if (testId.length == 0) testId.push("testId");
        testId.push(keccak256(abi.encodePacked(testId[testId.length-1])));
        return testId[testId.length-1];
    }

    function oraclize_newRandomDSQuery(uint delay, uint N, uint callbackGas) public returns (bytes32) {
        delay;
        N;
        callbackGas;
        if (testId.length == 0) testId.push("testId");
        testId.push(keccak256(abi.encodePacked(testId[testId.length-1])));
        return testId[testId.length-1];
    }

    function oraclize_randomDS_proofVerify__returnCode(
        bytes32 _queryId,
        string memory _result,
        bytes memory _proof
    ) public view returns (uint) {
        _queryId;
        _result;
        _proof;
        return verify;
    }

    function oraclize_setProof(byte proofP) public pure {
        proofP;

    }

    function oraclize_randomDS_getSessionPubKeyHash() public pure returns (bytes32) {
        bytes32 temp = bytes32(uint(10));
        return temp;
    }

    function oraclize_randomDS_setCommitment(bytes32 queryId, bytes32 commitment) public pure {
        queryId;
        commitment;
    }

    function oraclize_getPrice(string memory datasource) public view returns (uint) {
        datasource;
        return oraclizePrice;
    }

    function oraclize_getPrice(string memory datasource, uint gaslimit) public view returns (uint) {
        datasource;
        gaslimit;
        return oraclizePrice;
    }

    function setOraclizePrice(uint _price) public {
        oraclizePrice = _price;
    }

    // parseInt
    function parseInt(string memory _a) internal pure returns (uint) {
        return parseInt(_a, 0);
    }

    // the following function has been written by Alex Beregszaszi (@axic), use it under the terms of the MIT license
    function copyBytes(
        bytes memory from,
        uint fromOffset,
        uint length,
        bytes memory to,
        uint toOffset
    ) internal pure returns (bytes memory) {
        uint minLength = length + toOffset;

        // Buffer too small
        require(to.length >= minLength); // Should be a better way?

        // NOTE: the offset 32 is added to skip the `size` field of both bytes variables
        uint i = 32 + fromOffset;
        uint j = 32 + toOffset;

        while (i < (32 + fromOffset + length)) {
            assembly {
                let tmp := mload(add(from, i))
                mstore(add(to, j), tmp)
            }
            i += 32;
            j += 32;
        }

        return to;
    }

    // parseInt(parseFloat*10^_b)
    function parseInt(string memory _a, uint _b) internal pure returns (uint _parsedInt) {
        bytes memory bresult = bytes(_a);
        uint mint = 0;
        bool decimals = false;
        for (uint i = 0; i < bresult.length; i++) {
            if ((uint(uint8(bresult[i])) >= 48) && (uint(uint8(bresult[i])) <= 57)) {
                if (decimals) {
                    if (_b == 0) {
                        break;
                    } else {
                        _b--;
                    }
                }
                mint *= 10;
                mint += uint(uint8(bresult[i])) - 48;
            } else if (uint(uint8(bresult[i])) == 46) {
                decimals = true;
            }
        }
        if (_b > 0) {
            mint *= 10 ** _b;
        }
        return mint;
    }
}

