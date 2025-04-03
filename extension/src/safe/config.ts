import { ethers } from 'ethers';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Type hashes
export const DOMAIN_SEPARATOR_TYPEHASH = '0x47e79534a245952e8b16893a336b85a3d9ea9fa8c573f3d803afb92a79469218';
export const DOMAIN_SEPARATOR_TYPEHASH_OLD = '0x035aff83d86937d35b32e04f0ddc6ff469290eef2f1b692d8a815c89404d4749';
export const SAFE_TX_TYPEHASH = '0xbb8310d486368db6bd6f849402fdd73ad53d316b5a4b2644ad6efe0f941286d8';
export const SAFE_TX_TYPEHASH_OLD = '0x14d461bc7412367e924637b363c7bf29b8f47e2f84869f4426e5633d8af47b20';
export const SAFE_MSG_TYPEHASH = '0x60b3cbf8b4a223d68d641b3b6ddf9a298e7f33710cf3d3a9d1146b5a6150fbca';

// Create AbiCoder instance
export const abiCoder = new ethers.AbiCoder();

// Trusted contract addresses
export const MultiSend = [
    '0x8D29bE29923b68abfDD21e541b9374737B49cdAD', // v1.1.1 (canonical)
    '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761', // v1.3.0 (canonical)
    '0x998739BFdAAdde7C933B942a68053933098f9EDa', // v1.3.0 (eip155)
    '0x0dFcccB95225ffB03c6FBB2559B530C2B7C8A912', // v1.3.0 (zksync)
    '0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526', // v1.4.1 (canonical)
];

export const MultiSendCallOnly = [
    '0x40A2aCCbd92BCA938b02010E17A5b8929b49130D', // v1.3.0 (canonical)
    '0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B', // v1.3.0 (eip155)
    '0xf220D3b4DFb23C4ade8C88E526C1353AbAcbC38F', // v1.3.0 (zksync)
    '0x9641d764fc13c8B624c04430C7356C1C7C8102e2', // v1.4.1 (canonical)
];

export const SafeMigration = [
    '0x526643F69b81B008F46d95CD5ced5eC0edFFDaC6', // v1.4.1 (canonical)
];

export const SafeToL2Migration = [
    '0xfF83F6335d8930cBad1c0D439A841f01888D9f69', // v1.4.1 (canonical)
];

export const SignMessageLib = [
    '0xA65387F16B013cf2Af4605Ad8aA5ec25a2cbA3a2', // v1.3.0 (canonical)
    '0x98FFBBF51bb33A056B08ddf711f289936AafF717', // v1.3.0 (eip155)
    '0x357147caf9C0cCa67DfA0CF5369318d8193c8407', // v1.3.0 (zksync)
    '0xd53cd0aB83D845Ac265BE939c57F53AD838012c9', // v1.4.1 (canonical)
];

// Combine all trusted addresses for delegate calls
export const TRUSTED_FOR_DELEGATE_CALL = [
    ...MultiSend,
    ...MultiSendCallOnly,
    ...SafeMigration,
    ...SafeToL2Migration,
    ...SignMessageLib,
];

// Network mapping
export const API_URLS: Record<string, string> = {
    arbitrum: 'https://safe-transaction-arbitrum.safe.global',
    aurora: 'https://safe-transaction-aurora.safe.global',
    avalanche: 'https://safe-transaction-avalanche.safe.global',
    base: 'https://safe-transaction-base.safe.global',
    'base-sepolia': 'https://safe-transaction-base-sepolia.safe.global',
    berachain: 'https://safe-transaction-berachain.safe.global',
    blast: 'https://safe-transaction-blast.safe.global',
    bsc: 'https://safe-transaction-bsc.safe.global',
    celo: 'https://safe-transaction-celo.safe.global',
    ethereum: 'https://safe-transaction-mainnet.safe.global',
    gnosis: 'https://safe-transaction-gnosis-chain.safe.global',
    'gnosis-chiado': 'https://safe-transaction-chiado.safe.global',
    ink: 'https://safe-transaction-ink.safe.global',
    linea: 'https://safe-transaction-linea.safe.global',
    mantle: 'https://safe-transaction-mantle.safe.global',
    optimism: 'https://safe-transaction-optimism.safe.global',
    polygon: 'https://safe-transaction-polygon.safe.global',
    'polygon-zkevm': 'https://safe-transaction-zkevm.safe.global',
    scroll: 'https://safe-transaction-scroll.safe.global',
    sepolia: 'https://safe-transaction-sepolia.safe.global',
    sonic: 'https://safe-transaction-sonic.safe.global',
    unichain: 'https://safe-transaction-unichain.safe.global',
    worldchain: 'https://safe-transaction-worldchain.safe.global',
    xlayer: 'https://safe-transaction-xlayer.safe.global',
    zksync: 'https://safe-transaction-zksync.safe.global',
};

export const CHAIN_IDS: Record<string, number> = {
    arbitrum: 42161,
    aurora: 1313161554,
    avalanche: 43114,
    base: 8453,
    'base-sepolia': 84532,
    berachain: 80094,
    blast: 81457,
    bsc: 56,
    celo: 42220,
    ethereum: 1,
    gnosis: 100,
    'gnosis-chiado': 10200,
    ink: 57073,
    linea: 59144,
    mantle: 5000,
    optimism: 10,
    polygon: 137,
    'polygon-zkevm': 1101,
    scroll: 534352,
    sepolia: 11155111,
    sonic: 146,
    unichain: 130,
    worldchain: 480,
    xlayer: 196,
    zksync: 324,
}; 