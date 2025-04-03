import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const apiKeySecret = secretsmanager.Secret.fromSecretNameV2(this, 'ImportedSecret', 'test/SafeTxHashVerifier/EtherscanAPI');

    const handler = new lambda.Function(this, 'Lambda', {
      functionName: 'SafeTxHashVerifier-ABI-retriever',
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'lambda.handler',
      code: lambda.Code.fromAsset('../lambda'),
      environment: {
        SECRET_ARN: apiKeySecret.secretArn,
        NODE_OPTIONS: '--enable-source-maps'  // Better error tracking
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 128,
      logRetention: cdk.aws_logs.RetentionDays.ONE_YEAR,  // Configure log retention
    });

    apiKeySecret.grantRead(handler);

    // Create IAM role for API Gateway CloudWatch logging
    const cloudWatchRole = new iam.Role(this, 'ApiGatewayCloudWatchRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AmazonAPIGatewayPushToCloudWatchLogs'
        )
      ]
    });

    // Set the CloudWatch role ARN on the API Gateway account
    const apiGatewayCloudWatchRole = new apigateway.CfnAccount(this, 'ApiGatewayAccount', {
      cloudWatchRoleArn: cloudWatchRole.roleArn
    });

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'SafeTxHashVerifierApi', {
      restApiName: 'SafeTxHashVerifier API',
      apiKeySourceType: apigateway.ApiKeySourceType.HEADER,
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'],
        allowMethods: ['GET'],
        allowHeaders: ['Content-Type', 'X-Api-Key', 'x-api-key'],
        maxAge: cdk.Duration.days(1)
      },
      minimumCompressionSize: 1000,  // Enable compression
      deployOptions: {
        dataTraceEnabled: true,      // Enable detailed logging
        tracingEnabled: true,        // Enable X-Ray tracing
        metricsEnabled: true,        // Enable metrics
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
      }
    });

    // Make sure the API Gateway is created after the role is attached to the account
    api.node.addDependency(apiGatewayCloudWatchRole);

    // Create usage plan with rate limit and quota
    const plan = api.addUsagePlan('UsagePlan', {
      name: 'Standard',
      throttle: {
        rateLimit: 5,    // 5 requests per second
        burstLimit: 5   // burst capacity
      },
      quota: {
        limit: 50000,    // Maximum number of requests
        period: apigateway.Period.DAY
      }
    });

    // Create API key
    const apiKey = api.addApiKey('ApiKey');
    plan.addApiKey(apiKey);

    // Add API Gateway as resource
    const verifier = api.root.addResource('abi');

    // Integrate Lambda with API Gateway
    const lambdaIntegration = new apigateway.LambdaIntegration(handler);

    // Add POST method with API key requirement
    verifier.addMethod('GET', lambdaIntegration, {
      apiKeyRequired: true
    });

    // Associate usage plan with API stage
    plan.addApiStage({
      stage: api.deploymentStage
    });

    // Output the API key ID (you'll need this to retrieve the key value)
    new cdk.CfnOutput(this, 'ApiKeyId', {
      value: apiKey.keyId
    });

    // Add output for API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url
    });

  }
}
