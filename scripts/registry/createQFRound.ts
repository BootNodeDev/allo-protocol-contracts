// This is a helper script to create a round.
// This should be created via the frontend and this script is meant to be used for quick test
// NOTE: this script deploys a round with a QF voting strategy an Merkle payout strategy
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { registryParams } from '../config/registry.config';
import { roundParams } from '../config/round.config';
import { strategiesParams } from '../config/strategies.config';
import { AlloSettingsParams } from '../config/allo.config';

import { encodeRoundParameters } from "../utils";
import * as utils from "../utils";
import { Registry } from "../../typechain";

utils.assertEnvironment();

export async function main() {

  const network = hre.network;

  const registryNetworkParams = registryParams[network.name];
  const strategiesNetworkParams = strategiesParams[network.name];
  const roundNetworkParams = roundParams[network.name];

  if (!registryNetworkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const addresses: Record<string, string> = {
    'registry': registryNetworkParams.proxyContactAddress,
    'roundFactory': roundNetworkParams.roundFactoryContract,
    'merklePayoutStrategy': strategiesNetworkParams.merklePayoutStrategy,
  }

  for (const address of Object.keys(addresses)) {
    if (!addresses[address]) {
      throw new Error(`error: missing registryContract`);
    }
  }

  const registryContract: Registry = await ethers.getContractAt('Registry', addresses.registry);


  await confirmContinue({
    "info" : "create a QF round",
    "Registry Contract": addresses.registry,
    "RoundFactory Contract": addresses.roundFactory,
    "QF Contract": addresses.merklePayoutStrategy,
    "network": network.name,
    "chainId": network.config.chainId
  });

  const encodedRoundParameters = await generateAndEncodeParams()
  const encodedStrategyParameters = await encodeStrategyParameters([
    '0xd35CCeEAD182dcee0F148EbaC9447DA2c4D449c4',
    '1000000000000'
  ])

  const roundTx = await registryContract.createRound(
    addresses.roundFactory,
    '0xc8f1373195f4d464951330f7485a5418558834b19b4ff4dbce22774843053e81', // program id
    addresses.merklePayoutStrategy,
    encodedRoundParameters,
    encodedStrategyParameters,
  );

  const receipt = await roundTx.wait();

  let roundAddress;
  let strategyAddress;

  if (receipt.events) {
    const roundEvent = receipt.events.find(e => e.event === 'RoundCreated');
    if (roundEvent && roundEvent.args) {
      roundAddress = roundEvent.args.roundAddress;
    }
    const strategyEvent = receipt.events.find(e => e.event === 'StrategyContractCreated');
    if (strategyEvent && strategyEvent.args) {
      strategyAddress = strategyEvent.args.strategyAddress;
    }
  }

  console.log("Txn hash: " + roundTx.hash);
  console.log("✅ Round created: ", roundAddress);
  console.log("✅ Strategy created: ", strategyAddress);
}

const generateAndEncodeParams = async (): Promise<string> => {

  const _currentTimestamp = (await ethers.provider.getBlock(
    await ethers.provider.getBlockNumber())
  ).timestamp;

  const roundMetaPtr = {
    protocol: 1,
    pointer: "bafkreiczbz6rtgxl2dtr5n2fzxu7p63bvnhr24m5dlgxntgnzt33atw244"
  };

  const applicationMetaPtr = {
    protocol: 1,
    pointer: "bafkreigjj5kqunvhatvhy4zobvv5fkhoghjpz2vfvw7calvqmgjc7jfvse"
  };

  const roles = [
    '0x57675342a57baD74336B1c3D2Dda83A29596CBFE'
  ]

  const roundStart = _currentTimestamp + 600; //10 min later
  const roundEnd = _currentTimestamp + 864000; // 10 days later

  const initRoundTime = [
    roundStart,
    roundEnd,
    roundStart,
    roundEnd,
  ];

  const initMetaPtr = [
    roundMetaPtr,
    applicationMetaPtr,
  ];

  const initRoles = [
    roles,  // adminRoles
    roles   // roundOperators
  ];

  let params = [
    initRoundTime,
    initMetaPtr,
    initRoles
  ];

  return encodeRoundParameters(params);

}

export const encodeStrategyParameters = (params: any[]): string => {
  return ethers.utils.defaultAbiCoder.encode(
    ["address", "uint256"],
    params
  )
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
