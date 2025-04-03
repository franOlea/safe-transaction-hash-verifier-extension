# Safe Transaction Hash Verifier Extension Lambda Function

This directory contains the AWS Lambda function used by the Safe Transaction Hash Verifier extension to fetch and process contract ABIs.

## Functionality

The Lambda function provides the following capabilities:

- Fetches contract ABIs from Etherscan-compatible APIs
- Handles proxy contract detection and resolution
- Supports multiple Ethereum-compatible networks:
  - Ethereum Mainnet
  - Sepolia Testnet
  - Arbitrum
  - Base

## Configuration

The Lambda function relies on AWS Secrets Manager for API keys with the following mapping:

- `sepolia-scanner-key`: Etherscan API key for Sepolia testnet
- `ethereum-scanner-key`: Etherscan API key for Ethereum mainnet
- `arbitrum-scanner-key`: Arbiscan API key
- `base-scanner-key`: Basescan API key

## Local Development

### Prerequisites

- Node.js 16+
- AWS SAM CLI (optional, for local testing)
- AWS CLI configured with appropriate credentials

## API Format

### Request Example

```json
{
  "network": "ethereum",
  "address": "0x1234567890123456789012345678901234567890"
}
```

### Response Example

```json
[
  // ...
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ...
]
```

## Deployment

The Lambda function is deployed using the CDK infrastructure in the [`infra`](../infra) directory.

## Troubleshooting

Common issues:

- **Rate limiting**: Etherscan APIs have rate limits. Consider implementing caching.
- **Proxy detection failures**: Some proxy patterns might not be detected. Check the proxy detection logic.
- **Missing ABI**: Contract might not be verified on the block explorer.

For deployment issues, check CloudWatch logs and the CDK deployment outputs.
