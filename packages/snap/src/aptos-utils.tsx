import { AptosClient, AptosAccount, CoinClient, HexString } from "aptos";

const APTOS_NODE_URL = "https://fullnode.testnet.aptoslabs.com/v1"; // Changed to testnet
const client = new AptosClient(APTOS_NODE_URL);
const coinClient = new CoinClient(client);

export async function deriveAptosAddress(privateKey: string): Promise<string> {
  const account = new AptosAccount(HexString.ensure(privateKey).toUint8Array());
  return account.address().hex();
}

export async function getAptosBalance(address: string): Promise<string> {
  try {
    const balance = await coinClient.checkBalance(address);
    return balance.toString();
  } catch (error) {
    console.error("Error fetching balance:", error);
    // Check if the error message includes 'resource_not_found'
    if (error instanceof Error && error.message.includes('resource_not_found')) {
      console.log(`Account ${address} not found or has no balance. Returning 0.`);
      return "0";
    }
    // Re-throw the error if it's not a 'resource not found' error
    throw error;
  }
}