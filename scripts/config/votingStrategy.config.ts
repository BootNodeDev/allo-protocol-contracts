// Update this file any time a new QF voting contract has been deployed
type QFVotingParams = {
  factory: string;
  implementation: string;
  contract: string
};

type DeployParams = Record<string, QFVotingParams>;

export const QFVotingParams: DeployParams = {
  "mainnet": {
    factory: '0x4a850F463D1C4842937c5Bc9540dBc803D744c9F',
    implementation: '0xDdC143f736f912Ae6AAF2fceF2C78b267745B0f2',
    contract: ''
  },
  "goerli": {
    factory: '0x06A6Cc566c5A88E77B1353Cdc3110C2e6c828e38',
    implementation: '0x6391D8315EDEe9Ce6F2A18c7D52D31EF1cD429BD',
    contract: '0x7440B25bBeAa4290d61c78556fFC4B1FA96E0CdC'
  },
  "optimism-mainnet": {
    factory: '0x838C5e10dcc1e54d62761d994722367BA167AC22',
    implementation: '0x9Bb7eE67b688E4a5E9D24CF9604996c8DFA1C9ab',
    contract: ''
  },
  "fantom-mainnet": {
    factory: '',
    implementation: '',
    contract: ''
  },
  "fantom-testnet": {
    factory: '',
    implementation: '',
    contract: ''
  }
};

export const DummyVotingParams: Record<string, {contract: string}> = {
  "mainnet": {
    contract: ''
  },
  "goerli": {
    contract: '0x717A2cCDD81944e64c8BD9BB1D179A241dE14B46'
  },
  "optimism-mainnet": {
    contract: ''
  },
  "fantom-mainnet": {
    contract: ''
  },
  "fantom-testnet": {
    contract: ''
  }
};
