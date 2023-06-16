import { Contract, Wallet, utils, BigNumber, BigNumberish, Signer, PopulatedTransaction } from "ethers"

export interface MetaTransaction {
  to: string,
  value: string | number | BigNumber,
  data: string,
  operation: number,
}

export interface SafeTransaction extends MetaTransaction {
  safeTxGas: string | number,
  baseGas: string | number,
  gasPrice: string | number,
  gasToken: string,
  refundReceiver: string,
  nonce: string | number
}

export interface SafeSignature {
  signer: string,
  data: string
}

export const signHash = async (signer: Signer, hash: string): Promise<SafeSignature> => {
  const typedDataHash = utils.arrayify(hash)
  const signerAddress = await signer.getAddress()
  return {
      signer: signerAddress,
      data: (await signer.signMessage(typedDataHash)).replace(/1b$/, "1f").replace(/1c$/, "20")
  }
}

export const buildSignatureBytes = (signatures: SafeSignature[]): string => {
  signatures.sort((left, right) => left.signer.toLowerCase().localeCompare(right.signer.toLowerCase()))
  let signatureBytes = "0x"
  for (const sig of signatures) {
      signatureBytes += sig.data.slice(2)
  }
  return signatureBytes
}

export const executeTx = async (safe: Contract, safeTx: SafeTransaction, signatures: SafeSignature[], overrides?: any): Promise<any> => {
  const signatureBytes = buildSignatureBytes(signatures)
  return safe.execTransaction(safeTx.to, safeTx.value, safeTx.data, safeTx.operation, safeTx.safeTxGas, safeTx.baseGas, safeTx.gasPrice, safeTx.gasToken, safeTx.refundReceiver, signatureBytes, overrides || {})
}
