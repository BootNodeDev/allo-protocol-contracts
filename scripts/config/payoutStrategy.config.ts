// Update this file any time a new Payout Strategy contract has been added
type PayoutParams = {
  factory: string;
  implementation: string;
  contract: string;
};

type DeployParams = Record<string, PayoutParams>;

export const MerklePayoutParams: DeployParams = {
  mainnet: {
    factory: "0x8F8d78f119Aa722453d33d6881f4D400D67D054F",
    implementation: "0xfF94fAfC740Be8D2010304108266E7b90ed232fc",
    contract: "",
  },
  goerli: {
    factory: "0xE2Bf906f7d10F059cE65769F53fe50D8E0cC7cBe",
    implementation: "0xC808c9Ea4020E0F6Ec20715EEA0642fA6870B5Cc",
    contract: "0xCB64FFd025384E6353C1923Ce5Bda511229e2E92",
  },
  "optimism-mainnet": {
    factory: "0xB5365543cdDa2C795AD104F4cB784EF3DB1CD383",
    implementation: "0xF347ce7a0678afE4e7498172E5aaC76C5aEdB7de",
    contract: "",
  },
  "fantom-mainnet": {
    factory: "",
    implementation: "",
    contract: "",
  },
  "fantom-testnet": {
    factory: "",
    implementation: "",
    contract: "",
  },
};

export const DirectPayoutParams: DeployParams = {
  mainnet: {
    factory: "",
    implementation: "",
    contract: "",
  },
  goerli: {
    factory: "0x51cDB7de5476e3B85Ca76FEcD63862adc343aAe6",
    implementation: "0xAEd1cE441FA6aD4F89d28026F3E7491394deEa5F",
    contract: "0xe14c00F31fBF325FE35f461e6cb821286F6cF040",
  },
  "optimism-mainnet": {
    factory: "",
    implementation: "",
    contract: "",
  },
  "fantom-mainnet": {
    factory: "",
    implementation: "",
    contract: "",
  },
  "fantom-testnet": {
    factory: "",
    implementation: "",
    contract: "",
  },
};
