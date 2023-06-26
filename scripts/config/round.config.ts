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
    roundFactoryContract: '0x3254Df803c9996c6864560AA479c2CC83A604802',
    roundImplementationContract: '0x99D16Fe7cd5B9DD48E103B5B1DaBeECdB268cC16',
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
