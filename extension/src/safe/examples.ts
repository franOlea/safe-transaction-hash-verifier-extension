// import { calculateSafeHashes, SafeHashesOptions } from './hashes';

// // For calculating a transaction hash
// async function exampleTransactionHash() {
//     const options: SafeHashesOptions = {
//         network: 'ethereum',
//         address: '0x1234567890123456789012345678901234567890',
//         nonce: 42
//     };

//     try {
//         const result = await calculateSafeHashes(options);
//         console.log('Domain hash:', result.domainHash);
//         console.log('Message hash:', result.messageHash);
//         console.log('Safe transaction hash:', result.safeTransactionHash);

//         if (result.warnings.length > 0) {
//             console.warn('Warnings:', result.warnings);
//         }
//     } catch (error) {
//         console.error('Error:', error instanceof Error ? error.message : String(error));
//     }
// }

// // For calculating an off-chain message hash
// async function exampleMessageHash() {
//     const options: SafeHashesOptions = {
//         network: 'ethereum',
//         address: '0x1234567890123456789012345678901234567890',
//         messageContent: 'Hello, this is an off-chain message to be signed'
//     };

//     try {
//         const result = await calculateSafeHashes(options);
//         console.log('Domain hash:', result.domainHash);
//         console.log('Message hash:', result.messageHash);
//         console.log('Safe message hash:', result.safeTransactionHash);
//     } catch (error) {
//         console.error('Error:', error instanceof Error ? error.message : String(error));
//     }
// }

// // For calculating a nested Safe transaction hash
// async function exampleNestedTransactionHash() {
//     const options: SafeHashesOptions = {
//         network: 'ethereum',
//         address: '0x1234567890123456789012345678901234567890',
//         nonce: 42,
//         nestedSafeAddress: '0x0987654321098765432109876543210987654321',
//         nestedSafeNonce: 10
//     };

//     try {
//         const result = await calculateSafeHashes(options);
//         console.log('Primary Safe transaction hash:', result.safeTransactionHash);

//         if (result.nestedSafe) {
//             console.log('Nested Safe transaction hash:', result.nestedSafe.safeTransactionHash);
//         }
//     } catch (error) {
//         console.error('Error:', error instanceof Error ? error.message : String(error));
//     }
// }