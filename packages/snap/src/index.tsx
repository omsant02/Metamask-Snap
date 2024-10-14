import { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { Box, Text, Heading, Copyable } from '@metamask/snaps-sdk/jsx';
import { deriveAptosAddress, getAptosBalance } from './aptos-utils';

export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }) => {
  switch (request.method) {
    case 'hello':
      return snap.request({
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
        return snap.request({
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
      } catch (e) {
        console.error(e);
        return snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: (
              <Box>
                <Heading>Error</Heading>
                <Text>Failed to derive Aptos address.</Text>
              </Box>
            ),
          },
        });
      }

    case 'getAptosBalance':
      try {
        const { address } = request.params as { address: string };
        const balance = await getAptosBalance(address);
        return snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: (
              <Box>
                <Heading>Aptos Balance</Heading>
                <Text>Your balance is: {balance} APT</Text>
              </Box>
            ),
          },
        });
      } catch (e) {
        console.error(e);
        return snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: (
              <Box>
                <Heading>Error</Heading>
                <Text>Failed to fetch Aptos balance.</Text>
              </Box>
            ),
          },
        });
      }

    default:
      throw new Error('Method not found.');
  }
};