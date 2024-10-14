import { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { Box, Text, Heading, Copyable } from '@metamask/snaps-sdk/jsx';
import { deriveAptosAddress, getAptosBalance } from './aptos-utils';

export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
  switch (request.method) {
    case 'hello':
      await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: (
            <Box>
              <Heading>Hello!</Heading>
              <Text>Hello, {origin}!</Text>
              <Text>This is your Aptos&lt;&gt;MetaMask Snap.</Text>
            </Box>
          ),
        },
      });
      return true;

    case 'getAptosAddress':
      try {
        const bip44Entropy = await snap.request({
          method: 'snap_getBip44Entropy',
          params: {
            coinType: 637
          }
        });
        
        if (typeof bip44Entropy !== 'object' || !bip44Entropy.privateKey) {
          throw new Error('Invalid BIP44 entropy');
        }

        const address = await deriveAptosAddress(bip44Entropy.privateKey);
        console.log("Derived Aptos address:", address); // For debugging

        await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: (
              <Box>
                <Heading>Aptos Address</Heading>
                <Text>Your Aptos address is:</Text>
                <Copyable value={address} />
              </Box>
            ),
          },
        });

        return address;
      } catch (error: unknown) {
        console.error("Error in getAptosAddress:", error);
        await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: (
              <Box>
                <Heading>Error</Heading>
                <Text>Failed to derive Aptos address: {error instanceof Error ? error.message : 'Unknown error'}</Text>
              </Box>
            ),
          },
        });
        throw error;
      }

      case 'getAptosBalance':
        try {
          const { address } = request.params as { address: string };
          console.log("Fetching balance for address:", address); // For debugging
          const balance = await getAptosBalance(address);
          console.log("Fetched balance:", balance); // For debugging
  
          await snap.request({
            method: 'snap_dialog',
            params: {
              type: 'alert',
              content: (
                <Box>
                  <Heading>Aptos Balance</Heading>
                  <Text>Your balance is: {balance} APT</Text>
                  {balance === "0" && (
                    <Text>Note: This account may not exist on the network or have no balance.</Text>
                  )}
                </Box>
              ),
            },
          });
  
          return balance;
        } catch (error: unknown) {
          console.error("Error in getAptosBalance:", error);
          await snap.request({
            method: 'snap_dialog',
            params: {
              type: 'alert',
              content: (
                <Box>
                  <Heading>Error</Heading>
                  <Text>Failed to fetch Aptos balance: {error instanceof Error ? error.message : 'Unknown error'}</Text>
                </Box>
              ),
            },
          });
          throw error;
        }

    default:
      throw new Error('Method not found.');
  }
};