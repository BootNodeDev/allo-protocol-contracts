// Update this file any time a new contract has been deployed
type StrategyParams = {
  merklePayoutStrategy: string;
  directStrategy: string;
};

type DeployParams = Record<string, StrategyParams>;

export const strategiesParams: DeployParams = {
  "mainnet": {
    merklePayoutStrategy: '',
    directStrategy: '',
  },
  "goerli": {
    merklePayoutStrategy: '0x631De84A116314eCD6F5a87ff3893fced7E5f33F',
    directStrategy: '0xD8d9c9090A5651c361fd19C5669ba9AA48a8cFcD',
  },
  "optimism-mainnet": {
    merklePayoutStrategy: '',
    directStrategy: '',
  },
  "fantom-mainnet": {
    merklePayoutStrategy: '',
    directStrategy: '',
  },
  "fantom-testnet": {
    merklePayoutStrategy: '',
    directStrategy: '',
  }
};
