import { createConfig, http } from "wagmi";

import { config as dotenvConfig } from 'dotenv';
import { resolve } from "path";
import { sepolia } from "wagmi/chains";

dotenvConfig({ path: resolve(__dirname, './.env') });
const { NETWORK } = process.env;

console.log("network", NETWORK)
let networkConfig;

if (NETWORK === 'sepolia') {
  networkConfig = sepolia;
} else {
  networkConfig = {
    id: 1337,
    name: "ganache",
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: {
        http: ['http://127.0.0.1:7545'],
      },
      public: {
        http: ['http://127.0.0.1:7545'],
      },
    },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'http://127.0.0.1:7545' },
    },
    testnet: true,
  }
}
console.log("network", networkConfig)

export const wagmiConfig = createConfig({
  chains: [
    networkConfig
  ],
  transports: {
    // [sepolia.id]: http(`https://sepolia.infura.io/v3/0cf3624435f04a659fe5ed4d1568160f`),
    [networkConfig.id]: http(networkConfig.rpcUrls?.default?.http?.[0]),
  },
  // storage: createStorage({
  //   storage: cookieStorage
  // }),
  // ssr: true,
})
