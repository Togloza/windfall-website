import { canto } from "wagmi/chains";

import type { NetworkConfig } from "./types";

export enum ChainId {
  CantoTestnet = 7701,
  Canto = 7700,
}

export function isSupportChain(chainId: number): chainId is ChainId {
  return Object.values(ChainId).includes(chainId);
}

export const CHAIN_CONFIG: Record<ChainId, NetworkConfig> = {
  [ChainId.CantoTestnet]: {
    id: 7701,
    name: "Canto Testnet",
    network: "canto",
    nativeCurrency: {
      name: "Canto",
      symbol: "CANTO",
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: [`https://canto-testnet.plexnode.wtf`],
      },
      public: {
        http: [`https://canto-testnet.plexnode.wtf`],
      },
    },
    address: {
      tokenProvider: "0xA631523aC0Aa65dDB8E3a13eBc5B00A66C0CC8d7",
      stakeProvider: "0xC06940e81e6337344E16d67DDb33dD6144eBe2CE",
      turnstile: "0xe371237E2d8Acf58356b8Da263ad952528CDfd8b",
    },
    testnet: true,
  },

  [ChainId.Canto]: {
    ...canto,
    address: {
      tokenProvider: "0x5A057E35f8Bb1e896853a8dB40ac002153ac9a4A",
      stakeProvider: "0xEB0a4E999DC0AB2cFD1b39202B3BD6973c0989DC",
    },
  },
};
