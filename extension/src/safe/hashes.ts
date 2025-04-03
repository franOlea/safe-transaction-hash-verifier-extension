import { ethers } from 'ethers';
import {
    ZERO_ADDRESS,
    DOMAIN_SEPARATOR_TYPEHASH,
    DOMAIN_SEPARATOR_TYPEHASH_OLD,
    SAFE_TX_TYPEHASH,
    SAFE_TX_TYPEHASH_OLD,
    SAFE_MSG_TYPEHASH,
    abiCoder,
    API_URLS,
    CHAIN_IDS,
    TRUSTED_FOR_DELEGATE_CALL
} from '@/safe/config';
import { fetchSafeTransaction } from '@/lib/api';
import { ValidationError, TransactionError } from '@/lib/errors';

// Data Structures
export interface SafeTransactionData {
    to: string;
    value: string;
    data: string;
    operation: number;
    safeTxGas: string;
    baseGas: string;
    gasPrice: string;
    gasToken: string;
    refundReceiver: string;
    nonce: number;
}

export interface SafeHashesOptions {
    network: string;
    address: string;
    nonce?: number;
    nestedSafeAddress?: string;
    nestedSafeNonce?: number;
    messageContent?: string;
    transactionData?: SafeTransactionData;
    version?: string;
    nestedSafeVersion?: string;
}

export interface SafeHashesResult {
    domainHash: string;
    messageHash: string;
    safeTransactionHash: string;
    nestedSafe?: {
        domainHash: string;
        messageHash: string;
        safeTransactionHash: string;
    };
    warnings: string[];
    transactionData?: SafeTransactionData;
}

/**
 * Main entry point for calculating Safe hashes
 * Handles both transaction hashes and off-chain message hashes
 */
export async function calculateSafeHashes(options: SafeHashesOptions): Promise<SafeHashesResult> {
    const {
        network,
        address,
        nonce,
        nestedSafeAddress,
        nestedSafeNonce,
        messageContent,
        transactionData,
        version = '1.3.0',
        nestedSafeVersion = '1.3.0',
    } = options;

    // Validate input parameters
    validateInputParameters(network, address, nestedSafeAddress);

    const chainId = CHAIN_IDS[network];
    const warnings: string[] = [];

    // Handle message hashing if messageContent is provided
    if (messageContent) {
        return calculateMessageHashes(
            chainId,
            address,
            messageContent,
            version,
            nestedSafeAddress,
            nestedSafeVersion
        );
    }

    // For transaction hashing, either nonce or transactionData must be provided
    if (nonce === undefined && !transactionData) {
        throw new ValidationError('Either nonce or transactionData must be provided for transaction hashing');
    }

    // Get transaction data either from input or by fetching from API
    const txData = await getTransactionData(network, address, nonce, transactionData);

    // Check for potential security issues
    checkTransactionSecurity(txData, warnings);

    // Calculate transaction hashes
    const hashes = calculateTransactionHashes(
        chainId,
        address,
        txData,
        version
    );

    // Prepare result object
    const result: SafeHashesResult = {
        domainHash: hashes.domainHash,
        messageHash: hashes.messageHash,
        safeTransactionHash: hashes.safeTransactionHash,
        warnings,
        transactionData: txData,
    };

    // Calculate nested Safe hashes if needed
    if (nestedSafeAddress && nestedSafeNonce !== undefined) {
        result.nestedSafe = calculateNestedSafeHashes(
            chainId,
            nestedSafeAddress,
            address,
            hashes.safeTransactionHash,
            nestedSafeNonce,
            nestedSafeVersion
        );
    }

    return result;
}

// Input Validation
function validateInputParameters(network: string, address: string, nestedSafeAddress?: string): void {
    if (!network || !address) {
        throw new ValidationError('Network and address parameters are required');
    }

    if (!API_URLS[network]) {
        throw new ValidationError(`Invalid network: ${network}`);
    }

    if (!ethers.isAddress(address)) {
        throw new ValidationError(`Invalid address: ${address}`);
    }

    if (nestedSafeAddress && !ethers.isAddress(nestedSafeAddress)) {
        throw new ValidationError(`Invalid nested Safe address: ${nestedSafeAddress}`);
    }
}

// Security checks for transaction data
function checkTransactionSecurity(txData: SafeTransactionData, warnings: string[]): void {
    // Check for delegate call to untrusted contracts
    if (txData.operation === 1 && !TRUSTED_FOR_DELEGATE_CALL.includes(txData.to)) {
        warnings.push(`WARNING: The transaction includes an untrusted delegate call to address ${txData.to}`);
    }

    // Check for potential gas token attacks
    if (txData.gasToken !== ZERO_ADDRESS && txData.refundReceiver !== ZERO_ADDRESS) {
        warnings.push(
            'WARNING: This transaction uses a custom gas token and a custom refund receiver. ' +
            'This combination can be used to hide a rerouting of funds through gas refunds.'
        );

        if (txData.gasPrice !== '0') {
            warnings.push(
                'Furthermore, the gas price is non-zero, which increases the potential for hidden value transfers.'
            );
        }
    } else if (txData.gasToken !== ZERO_ADDRESS) {
        warnings.push('WARNING: This transaction uses a custom gas token. Please verify that this is intended.');
    } else if (txData.refundReceiver !== ZERO_ADDRESS) {
        warnings.push('WARNING: This transaction uses a custom refund receiver. Please verify that this is intended.');
    }
}

// Fetch or use provided transaction data
async function getTransactionData(
    network: string,
    address: string,
    nonce?: number,
    transactionData?: SafeTransactionData
): Promise<SafeTransactionData> {
    if (transactionData) {
        return transactionData;
    }

    try {
        // Fetch transaction data from the Safe API
        const transaction = await fetchSafeTransaction(network, address, nonce || 0);
        return {
            to: transaction.to || ZERO_ADDRESS,
            value: transaction.value || '0',
            data: transaction.data || '0x',
            operation: transaction.operation || 0,
            safeTxGas: transaction.safeTxGas || '0',
            baseGas: transaction.baseGas || '0',
            gasPrice: transaction.gasPrice || '0',
            gasToken: transaction.gasToken || ZERO_ADDRESS,
            refundReceiver: transaction.refundReceiver || ZERO_ADDRESS,
            nonce: transaction.nonce,
        };
    } catch (error) {
        throw new TransactionError(`Failed to fetch transaction data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Calculate nested Safe hashes for nested Safe operations
function calculateNestedSafeHashes(
    chainId: number,
    nestedSafeAddress: string,
    parentSafeAddress: string,
    parentTxHash: string,
    nestedSafeNonce: number,
    nestedSafeVersion: string
): { domainHash: string; messageHash: string; safeTransactionHash: string } {
    // Create approveHash transaction for the nested Safe
    const approveHashTx: SafeTransactionData = {
        to: parentSafeAddress,
        value: '0',
        data: `0xd4d9bdcd${parentTxHash.slice(2)}`, // approveHash(bytes32) function
        operation: 0,
        safeTxGas: '0',
        baseGas: '0',
        gasPrice: '0',
        gasToken: ZERO_ADDRESS,
        refundReceiver: ZERO_ADDRESS,
        nonce: nestedSafeNonce,
    };

    return calculateTransactionHashes(
        chainId,
        nestedSafeAddress,
        approveHashTx,
        nestedSafeVersion
    );
}

/**
 * Calculates hashes for a Safe transaction
 */
function calculateTransactionHashes(
    chainId: number,
    safeAddress: string,
    txData: SafeTransactionData,
    version: string
): { domainHash: string; messageHash: string; safeTransactionHash: string } {
    const cleanVersion = version.split('+')[0]; // Remove any suffix like +L2

    // Select typehash and arguments based on version
    const domainHashInfo = getDomainHashInfo(cleanVersion, chainId, safeAddress);
    const domainHash = calculateDomainHash(domainHashInfo.args);

    // Select transaction typehash based on version
    const safeTypehash = compareVersions(cleanVersion, '1.0.0') < 0
        ? SAFE_TX_TYPEHASH_OLD
        : SAFE_TX_TYPEHASH;

    // Hash the transaction data
    const dataHashed = ethers.keccak256(txData.data);

    // Encode the transaction message
    const messageEncoded = abiCoder.encode(
        ['bytes32', 'address', 'uint256', 'bytes32', 'uint8', 'uint256', 'uint256', 'uint256', 'address', 'address', 'uint256'],
        [
            safeTypehash,
            txData.to,
            txData.value,
            dataHashed,
            txData.operation,
            txData.safeTxGas,
            txData.baseGas,
            txData.gasPrice,
            txData.gasToken,
            txData.refundReceiver,
            txData.nonce,
        ]
    );

    const messageHash = ethers.keccak256(messageEncoded);

    // Calculate the final Safe transaction hash with EIP-712
    const safeTransactionHash = ethers.keccak256(
        ethers.solidityPacked(
            ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
            ['0x19', '0x01', domainHash, messageHash]
        )
    );

    return {
        domainHash,
        messageHash,
        safeTransactionHash,
    };
}

/**
 * Calculates hashes for an off-chain message
 */
function calculateMessageHashes(
    chainId: number,
    safeAddress: string,
    message: string,
    version: string,
    nestedSafeAddress?: string,
    nestedSafeVersion?: string
): SafeHashesResult {
    // Calculate the message hash (similar to the cast hash-message command)
    const messageHash = ethers.hashMessage(message);

    // Get domain hash information based on version
    const cleanVersion = version.split('+')[0];
    const domainHashInfo = getDomainHashInfo(cleanVersion, chainId, safeAddress);
    const domainHash = calculateDomainHash(domainHashInfo.args);

    // Encode the message using the Safe message typehash
    const encodedMessage = abiCoder.encode(
        ['bytes32', 'bytes32'],
        [SAFE_MSG_TYPEHASH, ethers.keccak256(abiCoder.encode(['bytes32'], [messageHash]))]
    );

    const signMessageHash = ethers.keccak256(encodedMessage);

    // Calculate the final Safe message hash with EIP-712
    const safeMessageHash = ethers.keccak256(
        ethers.solidityPacked(
            ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
            ['0x19', '0x01', domainHash, signMessageHash]
        )
    );

    const result: SafeHashesResult = {
        domainHash,
        messageHash: signMessageHash,
        safeTransactionHash: safeMessageHash,
        warnings: [],
    };

    // Calculate nested Safe message hashes if needed
    if (nestedSafeAddress && nestedSafeVersion) {
        result.nestedSafe = calculateNestedSafeMessageHashes(
            chainId,
            nestedSafeAddress,
            safeAddress,
            messageHash,
            domainHashInfo.typehash,
            nestedSafeVersion
        );
    }

    return result;
}

/**
 * Calculate nested Safe message hashes
 */
function calculateNestedSafeMessageHashes(
    chainId: number,
    nestedSafeAddress: string,
    parentSafeAddress: string,
    messageHash: string,
    domainSeparatorTypehash: string,
    nestedSafeVersion: string
): { domainHash: string; messageHash: string; safeTransactionHash: string } {
    // Get domain hash info for nested Safe
    const cleanNestedVersion = nestedSafeVersion.split('+')[0];
    const nestedDomainHashInfo = getDomainHashInfo(cleanNestedVersion, chainId, nestedSafeAddress);
    const nestedDomainHash = calculateDomainHash(nestedDomainHashInfo.args);

    // Create the message domain hash for the original Safe
    const messageDomainHash = ethers.keccak256(
        abiCoder.encode(
            ['bytes32', 'uint256', 'address'],
            [domainSeparatorTypehash, chainId, parentSafeAddress]
        )
    );

    // Encode the original message
    const nestedMessage = abiCoder.encode(
        ['bytes32', 'bytes32'],
        [SAFE_MSG_TYPEHASH, ethers.keccak256(messageHash)]
    );

    const hashedEncodedMessage = ethers.keccak256(nestedMessage);

    // Calculate the Safe message with EIP-712
    const safeMsg = ethers.keccak256(
        ethers.solidityPacked(
            ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
            ['0x19', '0x01', messageDomainHash, hashedEncodedMessage]
        )
    );

    // Now encode this for the nested Safe to sign
    const nestedMessageHash = ethers.keccak256(
        abiCoder.encode(
            ['bytes32', 'bytes32'],
            [SAFE_MSG_TYPEHASH, ethers.keccak256(abiCoder.encode(['bytes32'], [safeMsg]))]
        )
    );

    // Final hash that the nested Safe will sign with EIP-712
    const nestedSafeMessageHash = ethers.keccak256(
        ethers.solidityPacked(
            ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
            ['0x19', '0x01', nestedDomainHash, nestedMessageHash]
        )
    );

    return {
        domainHash: nestedDomainHash,
        messageHash: nestedMessageHash,
        safeTransactionHash: nestedSafeMessageHash,
    };
}

/**
 * Get domain hash typehash and arguments based on version
 */
function getDomainHashInfo(
    version: string,
    chainId: number,
    safeAddress: string
): { typehash: string; args: string[] } {
    let typehash = DOMAIN_SEPARATOR_TYPEHASH;
    let args: string[];

    if (compareVersions(version, '1.2.0') <= 0) {
        typehash = DOMAIN_SEPARATOR_TYPEHASH_OLD;
        args = [typehash, safeAddress];
    } else {
        args = [typehash, chainId.toString(), safeAddress];
    }

    return { typehash, args };
}

/**
 * Calculate domain hash from arguments
 */
function calculateDomainHash(args: string[]): string {
    return ethers.keccak256(abiCoder.encode(
        Array(args.length).fill('bytes32').slice(0, 1).concat(
            args.slice(1).map(arg => {
                if (ethers.isAddress(arg)) return 'address';
                if (!isNaN(Number(arg))) return 'uint256';
                return 'bytes32';
            })
        ),
        args
    ));
}

/**
 * Compare semantic versions
 * Returns: -1 if v1 < v2, 1 if v1 > v2, 0 if equal
 */
function compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const part1 = parts1[i] || 0;
        const part2 = parts2[i] || 0;

        if (part1 < part2) return -1;
        if (part1 > part2) return 1;
    }

    return 0;
} 