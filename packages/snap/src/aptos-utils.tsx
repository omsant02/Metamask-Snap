import { AptosClient, AptosAccount, CoinClient, HexString } from "aptos";

const APTOS_NODE_URL = "https://fullnode.mainnet.aptoslabs.com/v1";
const client = new AptosClient(APTOS_NODE_URL);
const coinClient = new CoinClient(client);

export async function deriveAptosAddress(privateKey: string): Promise<string> {
  const account = new AptosAccount(HexString.ensure(privateKey).toUint8Array());
  return account.address().hex();
}

export async function getAptosBalance(address: string): Promise<string> {
  const balance = await coinClient.checkBalance(address);
  return balance.toString();
}