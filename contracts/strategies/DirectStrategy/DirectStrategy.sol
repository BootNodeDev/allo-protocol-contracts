// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

import {BaseStrategy} from "../BaseStrategy.sol";
import {AlloSettings} from "../../settings/AlloSettings.sol";
import {RoundImplementation} from "../../round/RoundImplementation.sol";
import {IAllowanceModule} from "./IAllowanceModule.sol";

/**
 * Allows voters to cast multiple weighted votes to grants with one transaction
 * This is inspired from BulkCheckout documented over at:
 * https://github.com/gitcoinco/BulkTransactions/blob/master/contracts/BulkCheckout.sol
 *
 * Emits event upon every transfer.
 */
contract DirectStrategy is BaseStrategy, ReentrancyGuardUpgradeable {
  using SafeERC20Upgradeable for IERC20Upgradeable;
  using AddressUpgradeable for address;

  string public constant VERSION = "0.2.0";

  // TODO - Add Review status
  enum ApplicationStatus {
    PENDING,
    ACCEPTED,
    REJECTED,
    CANCELED
  }

  struct Payment {
      address vault;
      address token;
      uint96 amount;
      address grantAddress;
      bytes32 projectId;
      uint256 applicationIndex;
      address allowanceModule;
      bytes allowanceSignature;
  }

  // --- Data ---

  /// @notice Funds vault address
  address public vaultAddress;

   /// @notice Allo Config Contract Address
  AlloSettings public alloSettings;

  /// @notice Round fee percentage
  uint32 public roundFeePercentage;

  /// @notice Round fee address
  address payable public roundFeeAddress;

  // Errors

  error DirectStrategy__vote_NotImplemented();
  error DirectStrategy__payout_ApplicationNotAccepted();
  error DirectStrategy__payout_NativeTokenNotAllowed();
  error DirectStrategy__payout_NotImplementedYet();

  // --- Event ---

  /// @notice Emitted when a Round fee percentage is updated
  event RoundFeePercentageUpdated(uint32 roundFeePercentage);

  /// @notice Emitted when a Round wallet address is updated
  event RoundFeeAddressUpdated(address roundFeeAddress);

  /// @notice Emitted when a payout is executed
  event PayoutMade(
      address indexed vault,
      address token,
      uint256 amount,
      address grantAddress,
      bytes32 indexed projectId,
      uint256 indexed applicationIndex,
      address allowanceModule
  );

  // --- Modifier ---

  /// @notice modifier to check if round has not ended.
  modifier roundHasNotEnded() {
    // slither-disable-next-line timestamp
    require(RoundImplementation(roundAddress).roundEndTime() >= block.timestamp, "round has ended");
     _;
  }

  /// @notice modifier to check if some address is round operator.
  modifier isCallerRoundOperator(address caller) {
    require(
      RoundImplementation(roundAddress).isRoundOperator(caller),
      "not round operator"
    );
    _;
  }

  // --- Constructor ---
  constructor() {
    _disableInitializers();
  }

  // --- Core methods ---

  /**
   * @notice It is used to initialize the strategy with any additional parameters that may be required.
   *  The parameters are passed during the creation of each round.
   * @param _encodedParams The encoded parameters passed during round creation.
   */
  function _initialize(bytes calldata _encodedParams) internal override {
        // Decode _encodedParameters
      (
        AlloSettings _alloSettings,
        address _vaultAddress,
        uint32  _roundFeePercentage,
        address _roundFeeAddress
      ) = abi.decode(_encodedParams, (
        (AlloSettings),
        address,
        uint32,
        address
      ));

      alloSettings = _alloSettings;
      vaultAddress = _vaultAddress;
      roundFeePercentage = _roundFeePercentage;
      roundFeeAddress = payable(_roundFeeAddress);
  }

  // @notice Update round fee percentage (only by ROUND_OPERATOR_ROLE)
  /// @param newFeePercentage new fee percentage
  function updateRoundFeePercentage(uint32 newFeePercentage) external isCallerRoundOperator(msg.sender) roundHasNotEnded {
    roundFeePercentage = newFeePercentage;
    emit RoundFeePercentageUpdated(roundFeePercentage);
  }

  // @notice Update round fee address (only by ROUND_OPERATOR_ROLE)
  /// @param newFeeAddress new fee address
  function updateRoundFeeAddress(address payable newFeeAddress) external isCallerRoundOperator(msg.sender) roundHasNotEnded {
    roundFeeAddress = newFeeAddress;
    emit RoundFeeAddressUpdated(roundFeeAddress);
  }

  function vote(bytes[] calldata encodedAllocations, address allocatorAddress) external override payable {
    revert DirectStrategy__vote_NotImplemented();
  }

  /**
   * @notice Invoked by a round operator to make direct payments of funds to a project application.
   *
   * @dev It can be used to pay from a given address using `ERC20.transferFrom`, or from
   * the configured vault in which case the AllowanceModule should be set as a Safe Module on the Safe Multisig vault,
   * and the caller as delegate on the AllowanceModule.
   * Using `transferFrom` only allow to pay with ERC20 tokens, and requires the indicated vault previously approved this
   * contract to use such ERC20 token on it behalf.
   * This 2 options are handled by the `payment.vault` parameter, if it set to an address different from address(0) then
   * the function will follow the `transferFrom` path.
   *
   * To complete the payment it is required for the project application to be on status ACCEPTED.
   *
   * @param payment payment data
   */
  function payout(Payment calldata payment) external nonReentrant isRoundOperator {
    uint256 currentStatus = RoundImplementation(roundAddress).getApplicationStatus(payment.applicationIndex);
    if (currentStatus != uint256(ApplicationStatus.ACCEPTED)) revert DirectStrategy__payout_ApplicationNotAccepted();

    // use transfer from
    if (payment.vault != address(0)) {
      if (payment.token == address(0)) revert DirectStrategy__payout_NativeTokenNotAllowed();
      /// @dev erc20 transfer to grant address
      // slither-disable-next-line arbitrary-send-erc20,reentrancy-events,
      SafeERC20Upgradeable.safeTransferFrom(
        IERC20Upgradeable(payment.token),
        payment.vault,
        payment.grantAddress,
        payment.amount
      );
    } else { // use Safe multisig vault
      IAllowanceModule allowanceModule = IAllowanceModule(payment.allowanceModule);
      allowanceModule.executeAllowanceTransfer(
          vaultAddress,
          payment.token,
          payable(payment.grantAddress),
          uint96(payment.amount),
          address(0),
          0,
          msg.sender,
          payment.allowanceSignature
      );
    }

    emit PayoutMade(payment.vault, payment.token, payment.amount, payment.grantAddress, payment.projectId, payment.applicationIndex, payment.allowanceModule);
  }

  function _version() internal virtual override pure returns (string memory) {
      return VERSION;
  }
}
