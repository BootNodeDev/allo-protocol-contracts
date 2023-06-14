# DirectStrategy





Allows voters to cast multiple weighted votes to grants with one transaction This is inspired from BulkCheckout documented over at: https://github.com/gitcoinco/BulkTransactions/blob/master/contracts/BulkCheckout.sol Emits event upon every transfer.



## Methods

### VERSION

```solidity
function VERSION() external view returns (string)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### alloSettings

```solidity
function alloSettings() external view returns (contract AlloSettings)
```

Allo Config Contract Address




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract AlloSettings | undefined |

### initialize

```solidity
function initialize(bytes _encodedParams) external nonpayable
```

Invoked by RoundImplementation on creation to set the round for which the voting contracts is to be used



#### Parameters

| Name | Type | Description |
|---|---|---|
| _encodedParams | bytes | undefined |

### payout

```solidity
function payout(DirectStrategy.Payment payment) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| payment | DirectStrategy.Payment | undefined |

### roundAddress

```solidity
function roundAddress() external view returns (address payable)
```

Round address




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address payable | undefined |

### roundFeeAddress

```solidity
function roundFeeAddress() external view returns (address payable)
```

Round fee address




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address payable | undefined |

### roundFeePercentage

```solidity
function roundFeePercentage() external view returns (uint32)
```

Round fee percentage




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint32 | undefined |

### updateRoundFeeAddress

```solidity
function updateRoundFeeAddress(address payable newFeeAddress) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newFeeAddress | address payable | new fee address |

### updateRoundFeePercentage

```solidity
function updateRoundFeePercentage(uint32 newFeePercentage) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| newFeePercentage | uint32 | new fee percentage |

### vaultAddress

```solidity
function vaultAddress() external view returns (address)
```

Funds vault address




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### version

```solidity
function version() external pure returns (string)
```

Returns the version of the contract




#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | string | undefined |

### vote

```solidity
function vote(bytes[] encodedAllocations, address allocatorAddress) external payable
```

Invoked by RoundImplementation which allows directly allocate funds for a project application

*- TODO - can be invoked by the round - supports ERC20 and Native token transfer*

#### Parameters

| Name | Type | Description |
|---|---|---|
| encodedAllocations | bytes[] | encoded list of votes |
| allocatorAddress | address | voter address |



## Events

### Initialized

```solidity
event Initialized(uint8 version)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| version  | uint8 | undefined |

### PayoutMade

```solidity
event PayoutMade(address indexed vault, address token, uint256 amount, address grantAddress, bytes32 indexed projectId, uint256 indexed applicationIndex)
```

Emitted when a payout is executed



#### Parameters

| Name | Type | Description |
|---|---|---|
| vault `indexed` | address | undefined |
| token  | address | undefined |
| amount  | uint256 | undefined |
| grantAddress  | address | undefined |
| projectId `indexed` | bytes32 | undefined |
| applicationIndex `indexed` | uint256 | undefined |

### RoundFeeAddressUpdated

```solidity
event RoundFeeAddressUpdated(address roundFeeAddress)
```

Emitted when a Round wallet address is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| roundFeeAddress  | address | undefined |

### RoundFeePercentageUpdated

```solidity
event RoundFeePercentageUpdated(uint32 roundFeePercentage)
```

Emitted when a Round fee percentage is updated



#### Parameters

| Name | Type | Description |
|---|---|---|
| roundFeePercentage  | uint32 | undefined |

### Voted

```solidity
event Voted(address token, uint256 amount, address indexed voter, address grantAddress, bytes32 indexed projectId, uint256 applicationIndex, address indexed roundAddress)
```

Emitted when a new vote is sent



#### Parameters

| Name | Type | Description |
|---|---|---|
| token  | address | undefined |
| amount  | uint256 | undefined |
| voter `indexed` | address | undefined |
| grantAddress  | address | undefined |
| projectId `indexed` | bytes32 | undefined |
| applicationIndex  | uint256 | undefined |
| roundAddress `indexed` | address | undefined |



## Errors

### DirectStrategy__payout_ApplicationNotAccepted

```solidity
error DirectStrategy__payout_ApplicationNotAccepted()
```






### DirectStrategy__payout_NativeTokenNotAllowed

```solidity
error DirectStrategy__payout_NativeTokenNotAllowed()
```






### DirectStrategy__payout_NotImplementedYet

```solidity
error DirectStrategy__payout_NotImplementedYet()
```






### DirectStrategy__vote_NotImplemented

```solidity
error DirectStrategy__vote_NotImplemented()
```







