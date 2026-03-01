// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract CertificateContract {

  struct file {
    string cid;
    address owner;
    uint256 timestamp;
  }

  mapping (bytes32 => file) private _certificates;
  mapping (address => bytes32[]) private _userCertificates;


  event CertificateCreated(address indexed owner, bytes32 indexed hash, uint256 timestamp);
  event CertificateValidated(address indexed owner, bytes32 indexed hash, uint256 timestamp);


  function addCertificate(address userAddress, string calldata cid, bytes32 hash) public {

    bool certificateAlreadyExists = _certificates[hash].owner == userAddress;

    if (certificateAlreadyExists) {
      revert("Certificate already exists for this user");
    }

    _certificates[hash] = file({
      cid: cid,
      owner: userAddress,
      timestamp: block.timestamp
    });

    _userCertificates[userAddress].push(hash);
    emit CertificateCreated(userAddress, hash, block.timestamp);
  }


  function getCertificates(address userAddress, uint256 page, uint256 perPage) public view returns (file[] memory) {

    bytes32[] memory userCertificatesHashes = _userCertificates[userAddress];

    uint256 totalCertificates = userCertificatesHashes.length;
    uint256 maxPages = totalCertificates / perPage + (totalCertificates % perPage == 0 ? 0 : 1);

    if (page > maxPages) {
      revert("Page number exceeds total pages");
    }

    uint256 offset = (page - 1) * perPage;
    uint256 limit = offset + perPage > totalCertificates ? totalCertificates : offset + perPage;

    file[] memory paginatedCertificates = new file[](limit - offset);

    for (uint256 i = offset; i < limit; i++) {
      paginatedCertificates[i - offset] = _certificates[userCertificatesHashes[i]];
    }

    return paginatedCertificates;
  }


  function validateCertificate(address userAddress, bytes32 hash) public {
    file memory certificate = _certificates[hash];

    if (certificate.owner == address(0)) {
      revert("Certificate does not exist");
    }

    if (certificate.owner != userAddress) {
      revert("Certificate does not belong to the specified user");
    }

    emit CertificateValidated(userAddress, hash, block.timestamp);
  }

}
