import { AddressZero } from "@ethersproject/constants";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { deployContract } from "ethereum-waffle";
import { Event, Wallet, BigNumber, BigNumberish } from 'ethers';
import { BytesLike, formatBytes32String, isAddress } from "ethers/lib/utils";
import { artifacts, ethers } from "hardhat";
import { Artifact } from "hardhat/types";
import {takeSnapshot, restoreSnapshot, currentTime} from "../../utils/utils";
import { encodeRoundParameters } from "../../../scripts/utils";
import { ApplicationStatus } from "../../../utils/applicationStatus";
import {
  DirectStrategy,
  AlloSettings,
  MockRoundImplementation,
  MockERC20
} from "../../../typechain";

describe("DirectStrategy", () => {
  let snapshot: number;
  let admin: SignerWithAddress;
  let notRoundOperator: SignerWithAddress;
  let vault: SignerWithAddress;
  let grantee1: SignerWithAddress;

  let directStrategyImpl: DirectStrategy;
  let directAllocationStrategyProxy: DirectStrategy;
  let alloSettingsContract: AlloSettings;
  let mockRound: MockRoundImplementation;
  let mockERC20: MockERC20;

  let vaultAddress: string;
  let roundFeePercentage: BigNumberish;
  let roundFeeAddress: string;

  let strategyEncodedParams: string;

  const VERSION = "0.2.0";

  before(async () => {
    [admin, notRoundOperator, vault, grantee1] = await ethers.getSigners();

    // Deploy DirectStrategy contract
    let directAllocationStrategyFactory = await ethers.getContractFactory('DirectStrategy');
    directStrategyImpl = await directAllocationStrategyFactory.deploy();

    roundFeePercentage = 0;
    roundFeeAddress = Wallet.createRandom().address;
    vaultAddress = vault.address;

    let alloSettingsContractFactory = await ethers.getContractFactory('AlloSettings');
    alloSettingsContract = <AlloSettings>await upgrades.deployProxy(alloSettingsContractFactory);

    strategyEncodedParams = ethers.utils.defaultAbiCoder.encode(
      ["address", "address", "uint32", "address"],
      [alloSettingsContract.address, vaultAddress, roundFeePercentage, roundFeeAddress]
    )

    mockRound = await (await ethers.getContractFactory('MockRoundImplementation')).deploy() as MockRoundImplementation;
    mockERC20 = await (await ethers.getContractFactory('MockERC20')).deploy(1000000);
  })

  beforeEach(async () => {
    snapshot = await takeSnapshot();
  });

  afterEach(async () => {
    await restoreSnapshot(snapshot);
    snapshot = await takeSnapshot();
  });

  describe("constructor", () => {
    it("deploys properly", async () => {
      // Verify deploy
      expect(
        isAddress(directStrategyImpl.address),
        "Failed to deploy DirectStrategy"
      ).to.be.true;

      // Verify default value
      expect(await directStrategyImpl.roundAddress()).to.equal(
        AddressZero
      );
    });

    it("should not be possible to initialize the implementation contract", async () => {
      await expect(directStrategyImpl.initialize(strategyEncodedParams)).to.revertedWith("Initializable: contract is already initialized")
    })
  });

  describe("core functions", () => {
    describe("test: initialize", () => {
      before(async () => {
        // internally this calls initialize the proxy
        const txn = await mockRound.createAllocationStrategy(directStrategyImpl.address, strategyEncodedParams);
        const receipt = await txn.wait();

        if (receipt.events) {
          const event = receipt.events.find(e => e.event === 'NewAllocationStrategy');
          if (event && event.args) {
            directAllocationStrategyProxy = await ethers.getContractAt("DirectStrategy", event.args.proxyAddress) as DirectStrategy;
          }
        }
      });

      it("invoking init once SHOULD set the contract version", async () => {
        expect(await directAllocationStrategyProxy.VERSION()).to.equal(
          VERSION
        );
      });

      it("invoking init once SHOULD set the round address", async () => {
        expect(await directAllocationStrategyProxy.roundAddress()).to.equal(
          mockRound.address
        );
      });

      it("invoking init once SHOULD set the allo settings", async () => {
        expect(await directAllocationStrategyProxy.alloSettings()).to.equal(
          alloSettingsContract.address
        );
      });
      it("invoking init once SHOULD set the vault address", async () => {
        expect(await directAllocationStrategyProxy.vaultAddress()).to.equal(
          vaultAddress
        );
      });
      it("invoking init once SHOULD set the roundFee Percentage", async () => {
        expect(await directAllocationStrategyProxy.roundFeePercentage()).to.equal(
          roundFeePercentage
        );
      });
      it("invoking init once SHOULD set the roundFee Address", async () => {
        expect(await directAllocationStrategyProxy.roundFeeAddress()).to.equal(
          roundFeeAddress
        );
      });

      it("invoking initialize more than once SHOULD revert the transaction ", () => {
        // initialize is called when the clone is created in the factory
        expect(directAllocationStrategyProxy.connect(notRoundOperator).initialize(strategyEncodedParams)).to.revertedWith(
          "Initializable: contract is already initialized"
        );
      });
    });

    describe('test: updateRoundFeePercentage', () => {

      let denominator: number;

      before(async () => {
        denominator = await alloSettingsContract.DENOMINATOR();
      });

      it ('SHOULD revert if invoked by wallet who is not round operator', async () => {
        const newRoundFeePercentage = 10 * (denominator / 100);
        await expect(
          directAllocationStrategyProxy
            .connect(notRoundOperator)
            .updateRoundFeePercentage(newRoundFeePercentage)
        ).to.revertedWith(
          'not round operator'
        );
      });

      it ('SHOULD revert if round is ended', async () => {
        const newRoundFeePercentage = 10 * (denominator / 100);
        await mockRound.setEnded();

        let now = await currentTime();
        expect(await mockRound.roundEndTime()).to.be.lt(now)

        await expect(
          directAllocationStrategyProxy
            .updateRoundFeePercentage(newRoundFeePercentage)
        ).to.revertedWith(
          'round has ended'
        );
      });


      it ('SHOULD update roundFeePercentage value IF called is round operator', async () => {

        const newRoundFeePercentage = 10 * (denominator / 100);

        const txn = await directAllocationStrategyProxy.updateRoundFeePercentage(
          newRoundFeePercentage
        );
        await txn.wait();

        const roundFeePercentage =
          await directAllocationStrategyProxy.roundFeePercentage();
        expect(roundFeePercentage).equals(newRoundFeePercentage);
      });

      it ('SHOULD emit RoundFeePercentageUpdated event', async () => {

        const newRoundFeePercentage = 10 * (denominator / 100);

        const txn = await directAllocationStrategyProxy.updateRoundFeePercentage(
          newRoundFeePercentage
        );

        expect(txn)
          .to.emit(directAllocationStrategyProxy, "RoundFeePercentageUpdated")
          .withArgs(newRoundFeePercentage);
      });
    });

    describe("test: updateRoundFeeAddress", () => {
      let newRoundFeeAddress = Wallet.createRandom().address;

      it("SHOULD revert if invoked by wallet who is not round operator", async () => {
        await expect(
          directAllocationStrategyProxy
            .connect(notRoundOperator)
            .updateRoundFeeAddress(newRoundFeeAddress)
        ).to.revertedWith(
          'not round operator'
        );
      });


      it("SHOULD revert if round is ended", async () => {
        await mockRound.setEnded();

        let now = await currentTime();
        expect(await mockRound.roundEndTime()).to.be.lt(now)

        await expect(
          directAllocationStrategyProxy
            .updateRoundFeeAddress(newRoundFeeAddress)
        ).to.revertedWith(
          'round has ended'
        );
      });

      it("SHOULD update roundFeeAddress IF called is round operator", async () => {
        const txn = await directAllocationStrategyProxy.updateRoundFeeAddress(
          newRoundFeeAddress
        );
        await txn.wait();

        const roundFeeAddress = await directAllocationStrategyProxy.roundFeeAddress();
        expect(roundFeeAddress).equals(newRoundFeeAddress);
      });

      it("SHOULD emit RoundFeeAddressUpdated event", async () => {
        const txn = await directAllocationStrategyProxy.updateRoundFeeAddress(
          newRoundFeeAddress
        );

        expect(txn)
          .to.emit(directAllocationStrategyProxy, "RoundFeeAddressUpdated")
          .withArgs(newRoundFeeAddress);
      });
    });

    describe("test: vote", () => {
      let encodedVotes: BytesLike[] = [];
      const grantee1Index = 0;
      const grantee1GrantAmount = 10;

      before(async () => {
        encodedVotes.push(
          ethers.utils.defaultAbiCoder.encode(
            ["address", "uint256", "address", "bytes32", "uint256"],
            [
              mockERC20.address,
              grantee1GrantAmount,
              grantee1.address,
              formatBytes32String("grantee1"),
              grantee1Index,
            ]
          )
        );

        await mockERC20.transfer(vaultAddress, 1000);
        await mockERC20.connect(vault).approve(directAllocationStrategyProxy.address, ethers.constants.MaxUint256);
      });

      it("SHOULD revert when caller is not the round contract", async () => {
        await expect(directAllocationStrategyProxy.vote(encodedVotes, admin.address)).to.revertedWith("error: can be invoked only by round contract")
      })

      it("SHOULD revert when caller is not the round operator", async () => {
        await expect(mockRound.connect(notRoundOperator).vote(encodedVotes)).to.revertedWith("not round operator")
      })

      it("SHOULD revert if application is not APPROVED", async () => {
        expect(await mockRound.getApplicationStatus(grantee1Index)).to.eq(ApplicationStatus.PENDING)
        await expect(mockRound.vote(encodedVotes)).to.revertedWith("application not accepted")
      })

      it("SHOULD transfer indicated amount of ERC20 tokens from vault to grantee when application is APPROVED", async () => {
        expect(await mockRound.getApplicationStatus(grantee1Index)).to.eq(ApplicationStatus.PENDING)
        await mockRound.mockStatus(grantee1Index, ApplicationStatus.ACCEPTED);
        expect(await mockRound.getApplicationStatus(grantee1Index)).to.eq(ApplicationStatus.ACCEPTED)

        const balanceGrantee1Before = await mockERC20.balanceOf(grantee1.address);
        const balanceVaultBefore = await mockERC20.balanceOf(vaultAddress);

        await mockRound.vote(encodedVotes)

        expect(await mockERC20.balanceOf(grantee1.address)).to.eq(balanceGrantee1Before.add(grantee1GrantAmount))
        expect(await mockERC20.balanceOf(vaultAddress)).to.eq(balanceVaultBefore.sub(grantee1GrantAmount))
      })

      it("SHOULD transfer indicated amount of ERC20 tokens from SAFE vault to grantee when application is APPROVED");

      it("SHOULD emit an event for each payment");

      it("?? SHOULD transfer indicated amount of ETH from vault to grantee when application is APPROVED")

      it("?? SHOULD transfer indicated amount of ETH from SAFE vault to grantee when application is APPROVED")
    });
  });
});
