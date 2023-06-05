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
  const alloNetworkParams = AlloSettingsParams[network.name];

  if (!registryNetworkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const addresses: Record<string, string> = {
    'registry': registryNetworkParams.proxyContactAddress,
    'roundFactory': roundNetworkParams.roundFactoryContract,
    'directStrategy': strategiesNetworkParams.directStrategy,
    'alloSettingsContract': alloNetworkParams.alloSettingsContract
  }

  for (const address of Object.keys(addresses)) {
    if (!addresses[address]) {
      throw new Error(`error: missing registryContract`);
    }
  }

  const registryContract: Registry = await ethers.getContractAt('Registry', addresses.registry);

  // TODO - move to config env
  const metaPtrPointer = 'bafkreidc4qdp3u3shojzy4mwxxsh73zmt4pfd3vct5y2qwb6tytjwooc3m'

  const owners = [
    '0x57675342a57baD74336B1c3D2Dda83A29596CBFE'
  ]

  const projectMetaPtr = {
    protocol: 0,
    pointer: ''
  };

  const programMetaPtr = {
    protocol: 1,
    pointer: metaPtrPointer
  };

  await confirmContinue({
    "info" : "create a Direct round",
    "Registry Contract": addresses.registry,
    "RoundFactory Contract": addresses.roundFactory,
    "Direct Strategy Contract": addresses.directStrategy,
    "network": network.name,
    "chainId": network.config.chainId
  });

  const encodedRoundParameters = await generateAndEncodeParams()
  const encodedStrategyParameters = await encodeStrategyParameters([
    addresses.alloSettingsContract,
    '0x57675342a57baD74336B1c3D2Dda83A29596CBFE',
    '100',
    '0x57675342a57baD74336B1c3D2Dda83A29596CBFE'
  ])

  const roundTx = await registryContract.createRound(
    addresses.roundFactory,
    '0xc8f1373195f4d464951330f7485a5418558834b19b4ff4dbce22774843053e81', // program id
    addresses.directStrategy,
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
    pointer: "bafkreidcvh5qvtiyhelvwcrg5ai5ncs4ob53uodv67zlbia6aiufzitj5u"
  };

  const applicationMetaPtr = {
    protocol: 1,
    pointer: "bafkreih63qfn66rw6hkmuc43efbgj3pcuoszeat4pbdqmudymwr4bqs6em"
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
    ["address", "address", "uint32", "address"],
    params
  )
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
