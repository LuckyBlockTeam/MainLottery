pragma solidity 0.5.2;

import "./Manageable.sol";


contract KYCWhitelist is Manageable {
    mapping(address => bool) public whitelist;

    event AddressIsAdded(address participant);
    event AddressIsRemoved(address participant);

    function addParticipant(address _participant) public onlyManager {
        require(_participant != address(0), "");

        whitelist[_participant] = true;
        emit AddressIsAdded(_participant);
    }

    function removeParticipant(address _participant) public onlyManager {
        require(_participant != address(0), "");

        whitelist[_participant] = false;
        emit AddressIsRemoved(_participant);
    }

    function isWhitelisted(address _participant) public view returns (bool) {
        return whitelist[_participant];
    }
}