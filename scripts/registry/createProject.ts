// This is a helper script to create a round.
// This should be created via the frontend and this script is meant to be used for quick test
// NOTE: this script deploys a round with a QF voting strategy an Merkle payout strategy
import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { registryParams } from '../config/registry.config';
import { encodeRoundParameters } from "../utils";
import * as utils from "../utils";
import { AddressZero } from "@ethersproject/constants";
import { Registry } from "../../typechain";

utils.assertEnvironment();

export async function main() {

  const network = hre.network;

  const registryNetworkParams = registryParams[network.name];

  if (!registryNetworkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const registryContractAddress = registryNetworkParams.proxyContactAddress;

  if (!registryContractAddress) {
    throw new Error(`error: missing registryContract`);
  }

  const registryContract: Registry = await ethers.getContractAt('Registry', registryContractAddress);

  // TODO - move to config env
  const metaPtrPointer = 'bafkreigwiljyskihuaeyjsedoei3taprwbbheldxig25lhoqvw2kpcf4bu'

  const owners = [
    '0x57675342a57baD74336B1c3D2Dda83A29596CBFE'
  ]

  const projectMetaPtr = {
    protocol: 1,
    pointer: metaPtrPointer
  };

  const programMetaPtr = {
    protocol: 0,
    pointer: ''
  };

  await confirmContinue({
    "info" : "create a Project",
    "registryContract": registryContractAddress,
    "MetaPtr pointer": metaPtrPointer,
    "Owners": owners.join(', '),
    "network": network.name,
    "chainId": network.config.chainId
  });


  const roundTx = await registryContract.createProject(
    owners,
    projectMetaPtr,
    programMetaPtr,
  );

  const receipt = await roundTx.wait();
  let projectID;

  if (receipt.events) {
    const event = receipt.events.find(e => e.event === 'ProjectCreated');
    if (event && event.args) {
      projectID = event.args.projectID;
    }
  }

  console.log("Txn hash: " + roundTx.hash);
  console.log("✅ Project created: ", projectID);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
