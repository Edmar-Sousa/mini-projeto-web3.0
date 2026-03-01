const web3 = require('web3');
const CertificateContract = artifacts.require("CertificateContract");


contract("CertificateContractTest", function (accounts) {
  let certificateContractInstance;

  beforeEach(async () => {
    certificateContractInstance = await CertificateContract.new();
  });

  describe("Certificate Creation Tests", () => {
    it("try to create a certificate", async () => {
      const address = accounts[0];
      const hash = web3.utils.keccak256("Certificate Data");
      const cid = "QmYwAPJzv5CZsnAzt8auVTLhK1YtF1rV6X6s7s8tX5Z7z7";


      const tx = await certificateContractInstance.addCertificate(
        address,
        cid,
        hash
      );

      assert.equal(tx.logs[0].event, "CertificateCreated");
    });

    it("try to create a certificate already added", async () => {
      const address = accounts[0];
      const hash = web3.utils.keccak256("Certificate Data");
      const cid = "QmYwAPJzv5CZsnAzt8auVTLhK1YtF1rV6X6s7s8tX5Z7z7";

      const tx1 = await certificateContractInstance.addCertificate(
        address,
        cid,
        hash
      );

      assert.equal(tx1.logs[0].event, "CertificateCreated");

      try {
        const tx2 = await certificateContractInstance.addCertificate(
          address,
          cid,
          hash
        );

        assert.fail("Expected error not received");
      } catch (error) {
        assert(error.message.includes("Certificate already exists for this user"));
      }
    });
  });


  describe("Pagination Tests", () => {
    const address = accounts[0];
    const numberCertificates = 5;
    const perPage = 3;
    const maxPage = Math.floor(numberCertificates / perPage) + (numberCertificates % perPage > 0 ? 1 : 0);


    beforeEach(async () => {
      for (let i = 0; i < numberCertificates; i++) {
        const hash = web3.utils.keccak256(`Certificate Data ${i}`);
        const cid = `QmYwAPJzv5CZsnAzt8auVTLhK1YtF1rV6X6s7s8tX5Z7z${i}`;
  
        const tx = await certificateContractInstance.addCertificate(
          address,
          cid,
          hash
        );

      }
    });

    it("get certificate page with invalid perPage", async () => {
      const page = 1;

      const tx = await certificateContractInstance.getCertificates(address, page, perPage);
      assert.equal(tx.length, perPage, "Expected number of certificates not returned");
    });

    it("get certificate page with invalid perPage 3 and return 2", async () => {
      const page = 2;

      const tx = await certificateContractInstance.getCertificates(address, page, 3);
      assert.equal(tx.length, 2, "Expected number of certificates not returned");
    });

    it("get certificate page exceeds total", async () => {
      const page = maxPage + 1;
  
      try {
        const tx = await certificateContractInstance.getCertificates(address, page, perPage);
        assert.fail("Expected error not received");
      } catch (error) {
        assert(error.message.includes("Page number exceeds total pages"), "Expected error message not received");
      }

    });


  });


  describe("Certificate Authenticity Test", () => {
    const address = accounts[0];
    const hash = web3.utils.keccak256("Certificate Data");
    const cid = "QmYwAPJzv5CZsnAzt8auVTLhK1YtF1rV6X6s7s8tX5Z7z7";

    beforeEach(async () => {

      const tx = await certificateContractInstance.addCertificate(
        address,
        cid,
        hash
      );

      assert.equal(tx.logs[0].event, "CertificateCreated");
    });

    it("verify certificate authenticity", async () => {
      const tx = await certificateContractInstance.validateCertificate(address, hash);
      assert.equal(tx.logs[0].event, "CertificateValidated");
    });

    it("verify if a certificate belongs to a user", async () => {
      const otherAddress = accounts[1];

      try {
        const tx = await certificateContractInstance.validateCertificate(otherAddress, hash);
        assert.fail("Expected error not received");
      } catch (error) {
        assert(error.message.includes("Certificate does not belong to the specified user"), "Expected error message not received");
      }
    });

    it("verify certificate authenticity with invalid hash", async () => {
      const invalidHash = web3.utils.keccak256("Certificate Data 2");

      try {
        const tx = await certificateContractInstance.validateCertificate(address, invalidHash);
        assert.fail("Expected error not received");
      } catch (error) {
        assert(error.message.includes("Certificate does not exist"), "Expected error message not received");
      }
    });

  });

});
