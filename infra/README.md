# Safe Transaction Hash Verifier Extension Infrastructure

The extension relies on one dedicated API that basically serves as a faćade to 3rd party Safe API and Etherscan API. The extension pulls Safe transaction data from Safe and smart contract ABI data from Etherscan (for smart contract call transactions payload decoding)

## Prerequisites

- AWS account with appropriate permissions
- AWS CLI installed and configured
- Node.js 16+
- npm 7+
- CDK CLI: `npm install -g aws-cdk`
- CDK bootstrapped in your AWS account: `cdk bootstrap`

## Infrastructure Components

- **API Gateway**: REST API for extension requests
- **Lambda Function**: Processes ABI requests
- **CloudWatch**: Logs and monitoring
- **IAM Roles**: Security permissions
- **Secrets Manager**: API key storage

## Setup and Deployment

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure API keys in AWS Secrets Manager:

   ```bash
   aws secretsmanager create-secret --name scanner-keys --secret-string '{ \
      "ethereum-scanner-key": "YOUR-ETHEREUM-API-KEY", \
      "sepolia-scanner-key": "YOUR-SEPOLIA-API-KEY", \
      "arbitrum-scanner-key": "YOUR-ARBITRUM-API-KEY", \
      "base-scanner-key": "YOUR-BASE-API-KEY" \
   }'
   ```

3. Deploy the stack:

   ```bash
   npx cdk deploy
   ```

4. Note the API Gateway URL from the output:
   ```
   SafeTxHashesStack.ApiEndpoint = https://xxxxxxxx.execute-api.region.amazonaws.com/prod/
   ```

## Cost Considerations

- Lambda free tier: 1M requests/month
- API Gateway free tier: 1M requests/month
- Costs beyond free tier are based on usage
