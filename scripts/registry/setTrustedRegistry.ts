import { ethers } from "hardhat";
import hre from "hardhat";
import { confirmContinue } from "../../utils/script-utils";
import { AlloSettingsParams } from '../config/allo.config';
import { registryParams } from '../config/registry.config';
import * as utils from "../utils";
import { AlloSettings } from "../../typechain";

utils.assertEnvironment();

const TRUSTED_REGISTRY_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes("TRUSTED_REGISTRY")
);

export async function main() {

  const network = hre.network;

  const networkParams = AlloSettingsParams[network.name];
  const registryNetworkParams = registryParams[network.name];

  if (!networkParams) {
    throw new Error(`Invalid network ${network.name}`);
  }

  const alloSettingsContract = networkParams.alloSettingsContract;

  const alloSettings: AlloSettings = await ethers.getContractAt('AlloSettings', alloSettingsContract);

  await confirmContinue({
    "info": "set trusted registry in AlloSettings contract",
    "alloSettingsContract": alloSettingsContract,
    "registry Contract": registryNetworkParams.proxyContactAddress,
    "network": network.name,
    "chainId": network.config.chainId
  });

  const tx = await alloSettings.grantRole(TRUSTED_REGISTRY_ROLE, registryNetworkParams.proxyContactAddress)
  await tx.wait();

  console.log("✅ Txn hash: " + tx.hash);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
