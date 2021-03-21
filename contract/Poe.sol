pragma solidity ^0.6.2;

contract Poe {
    struct FileDetails {
        uint256 timestamp;
        string owner;
    }

    mapping(string => FileDetails) files;

    event LogFileAddedStatus(
        bool indexed status,
        uint256 timestamp,
        string owner,
        string fileHash
    );

    function set(string memory owner, string memory fileHash) public {
        if (files[fileHash].timestamp == 0) {
            files[fileHash] = FileDetails(block.timestamp, owner);

            emit LogFileAddedStatus(true, block.timestamp, owner, fileHash);
        } else {
            revert("POE: file already exists");
        }
    }

    function get(string memory fileHash)
        public
        view
        returns (uint256 timestamp, string memory owner)
    {
        return (files[fileHash].timestamp, files[fileHash].owner);
    }
}
