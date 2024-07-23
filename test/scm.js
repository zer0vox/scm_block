const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("SCM Contract", function () {
  let SCM;
  let scm;
  let owner;

  beforeEach(async function () {
    SCM = await ethers.getContractFactory("scm");
    [owner] = await ethers.getSigners();
    scm = await SCM.deploy();
    await scm.deployed();
  });

  it("Should register a new product", async function () {
    await scm.registerProduct(
      "Product1",
      "BrandA",
      "SN12345",
      "A sample product",
      "http://example.com/image.png",
      "ManufacturerA",
      "LocationA",
      "2024-07-01T00:00:00Z"
    );

    const [serialNumber, name, brand, description, image, history] = await scm.getProduct("SN12345");

    expect(name).to.equal("Product1");
    expect(brand).to.equal("BrandA");
    expect(description).to.equal("A sample product");
    expect(image).to.equal("http://example.com/image.png");
    expect(history.length).to.equal(1); // Ensure history has one entry
  });

  it("Should add product history", async function () {
    await scm.registerProduct(
      "Product2",
      "BrandB",
      "SN67890",
      "Another product",
      "http://example.com/another.png",
      "ManufacturerB",
      "LocationB",
      "2024-07-02T00:00:00Z"
    );

    await scm.addProductHistory(
      "SN67890",
      "DistributorB",
      "LocationC",
      "2024-07-03T00:00:00Z",
      true
    );

    const [, , , , , history] = await scm.getProduct("SN67890");

    expect(history.length).to.equal(2); // Ensure history has two entries
    expect(history[1].actor).to.equal("DistributorB");
  });

  it("Should fail to register a product with a duplicate serial number", async function () {
    await scm.registerProduct(
      "Product3",
      "BrandC",
      "SN99999",
      "Yet another product",
      "http://example.com/yet-another.png",
      "ManufacturerC",
      "LocationD",
      "2024-07-04T00:00:00Z"
    );

    // Try to register the same product again
    await expect(
      scm.registerProduct(
        "Product4",
        "BrandD",
        "SN99999",
        "Duplicate product",
        "http://example.com/duplicate.png",
        "ManufacturerD",
        "LocationE",
        "2024-07-05T00:00:00Z"
      )
    ).to.be.revertedWith("Product with this serial number already exists");

    // Alternatively, if you do not have a specific error message, you can use `.to.be.reverted`
    // await expect(
    //   scm.registerProduct(
    //     "Product4",
    //     "BrandD",
    //     "SN99999",
    //     "Duplicate product",
    //     "http://example.com/duplicate.png",
    //     "ManufacturerD",
    //     "LocationE",
    //     "2024-07-05T00:00:00Z"
    //   )
    // ).to.be.reverted;
  });
});
