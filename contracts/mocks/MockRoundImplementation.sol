// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "../strategies/BaseStrategy.sol";

contract MockRoundImplementation is AccessControlEnumerable {

  uint256 public nonce;

  bytes32 public constant ROUND_OPERATOR_ROLE = keccak256("ROUND_OPERATOR");

  BaseStrategy public strategyProxy;

  uint256 public roundEndTime;

  mapping(uint256 => uint256) private mockedStatuses;

  event NewAllocationStrategy(address proxyAddress);

  constructor() {
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(ROUND_OPERATOR_ROLE, msg.sender);
  }

  function createAllocationStrategy(address strategy, bytes calldata _allocationInitParams) external {
    address proxy = _createClone(strategy);
    strategyProxy = BaseStrategy(proxy);
    strategyProxy.initialize(_allocationInitParams);

    roundEndTime = block.timestamp + 365 days;

    emit NewAllocationStrategy(proxy);
  }

  function isRoundOperator(address account) public view returns (bool) {
    return hasRole(ROUND_OPERATOR_ROLE, account);
  }

  function vote(bytes[] memory encodedVotes) external payable {
    strategyProxy.vote{value: msg.value}(encodedVotes, msg.sender);
  }

  function setEnded() external {
    roundEndTime = block.timestamp - 1;
  }

  function mockStatus(uint256 applicationIndex, uint256 status) external {
    mockedStatuses[applicationIndex] = status;
  }

  function getApplicationStatus(uint256 applicationIndex) external view returns (uint256) {
    return mockedStatuses[applicationIndex];
  }

  function _createClone(address _impl) internal returns (address clone) {
        nonce++;
        bytes32 salt = keccak256(abi.encodePacked(msg.sender, nonce));
        clone = ClonesUpgradeable.cloneDeterministic(_impl, salt);
    }
}
