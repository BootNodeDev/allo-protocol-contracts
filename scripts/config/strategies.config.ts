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
    merklePayoutStrategy: '0xD8d9c9090A5651c361fd19C5669ba9AA48a8cFcD',
    directStrategy: '0xB3D300C8AB4EdF69a505D0ceC1252a97Ad60242F',
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
