// Update this file any time a new contract has been deployed
type RoundParams = {
  roundImplementationContract: string;
  roundFactoryContract: string;
  roundContract ?: string;
  newProtocolFeePercentage?: number;
  newProtocolTreasury?: string;
};

type DeployParams = Record<string, RoundParams>;

export const roundParams: DeployParams = {
  "mainnet": {
    roundFactoryContract: '0x9Cb7f434aD3250d1656854A9eC7A71EceC6eE1EF',
    roundImplementationContract: '0xbB614e55cf43842B3Ee96CfD7410E9487c627EFe',
    roundContract: '',
  },
  "goerli": {
    roundFactoryContract: '0x7aeb4408B198F8fbEb87007B82d863416dF3C8Af',
    roundImplementationContract: '0x9F5d27CFc759a8Caa068A6A5e0B3d2CA17087034',
    roundContract: '',
  },
  "optimism-mainnet": {
    roundFactoryContract: '0x04E753cFB8c8D1D7f776f7d7A033740961b6AEC2',
    roundImplementationContract: '0x9cB0679806225080BfC3A9A72b09a71B95756a84',
    roundContract: ''
  },
  "fantom-mainnet": {
    roundFactoryContract: '',
    roundImplementationContract: '',
    roundContract: ''
  },
  "fantom-testnet": {
    roundFactoryContract: '',
    roundImplementationContract: '',
    roundContract: ''
  }
};
