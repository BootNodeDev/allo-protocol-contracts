// Update this file any time a new project registry contract has been deployed / upgraded
type RegistryParams = {
  proxyContactAddress: string;
};

type DeployParams = Record<string, RegistryParams>;

export const projectRegistryParams: DeployParams = {
  "mainnet": {
    proxyContactAddress: '',
  },
  "goerli": {
    proxyContactAddress: '0x9Cd9211c719693610F2cF715F03a4cc3EAe96132',
  },
  "optimism-mainnet": {
    proxyContactAddress: '',
  },
  "fantom-mainnet": {
    proxyContactAddress: '',
  },
  "fantom-testnet": {
    proxyContactAddress: '',
  }
};
