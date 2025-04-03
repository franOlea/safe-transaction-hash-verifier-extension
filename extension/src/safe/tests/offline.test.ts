import { calculateSafeHashes, SafeTransactionData } from '../hashes.js';

/**
 * Test offline calculation of Safe Transaction Hash Verifier Extension
 */
async function testOfflineTransactionHash() {
    // Transaction details from command line arguments
    const txData: SafeTransactionData = {
        to: '0x13613fb95931D7cC2F1ae3E30e5090220f818032',
        value: '0',
        data: '0xa9059cbb00000000000000000000000092714591205ab6956a2738a208b074bd8043182d0000000000000000000000000000000000000000000000000de0b6b3a7640000',
        operation: 0,
        safeTxGas: '0',
        baseGas: '0',
        gasPrice: '0',
        gasToken: '0x0000000000000000000000000000000000000000',
        refundReceiver: '0x0000000000000000000000000000000000000000',
        nonce: 1
    };

    try {
        const result = await calculateSafeHashes({
            network: 'sepolia',
            address: '0x0275E1208A4973bDC8D557C35637577b3447458A',
            transactionData: txData
        });

        console.log('Domain hash:', result.domainHash);
        console.log('Message hash:', result.messageHash);
        console.log('safeTxHash:', result.safeTransactionHash);

        // Verify the hashes match expected values
        const expectedDomainHash = '0x8b904e3c3a6a2b7e0114d2ddbe01c1ab143e30077110a771cf2b431b10ffc4d4';
        const expectedMessageHash = '0x407ca9e30e4fb3c2adf9fde72ba03e4ebafbe573b11e1eb0b8c4a8373209d210';
        const expectedSafeTxHash = '0x0e4989c785bbef4f0e00a144f700bf1350f9e8556f9342286d71219bc9045914';

        if (result.domainHash !== expectedDomainHash ||
            result.messageHash !== expectedMessageHash ||
            result.safeTransactionHash !== expectedSafeTxHash) {
            console.error('❌ Test failed: Hashes do not match expected values');
            console.error(`Expected domain hash: ${expectedDomainHash}`);
            console.error(`Expected message hash: ${expectedMessageHash}`);
            console.error(`Expected safeTxHash: ${expectedSafeTxHash}`);
        } else {
            console.log('✅ Test passed: All hashes match expected values');
        }

        if (result.warnings.length > 0) {
            console.warn('Warnings:', result.warnings);
        }
    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
    }
}

// Run the test
testOfflineTransactionHash(); 