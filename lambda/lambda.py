import json
import boto3
import urllib.request  # Native Python HTTP client
import os
import logging
from typing import Optional, Dict

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

class Config:
    NETWORK_URLS = {
        'sepolia': 'api-sepolia.etherscan.io',
        'ethereum': 'api.etherscan.io',
        'arbitrum': 'api.arbiscan.io',
        'base': 'api.basescan.org',
    }
    
    API_KEY_MAPPING = {
        'sepolia': 'sepolia-scanner-key',
        'ethereum': 'ethereum-scanner-key',
        'arbitrum': 'arbitrum-scanner-key',
        'base': 'base-scanner-key'
    }
    
    IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"

class EtherscanClient:
    def __init__(self, api_key: str, network: str):
        self.api_key = api_key
        self.network = network
        
        if network not in Config.NETWORK_URLS:
            raise ValueError(f"Unsupported network: {network}")
        self.base_url = Config.NETWORK_URLS[network]
    
    def get_abi(self, contract_address: str) -> str:
        logger.info(f"Fetching ABI for {contract_address}")
        
        url = f"https://{self.base_url}/api?module=contract&action=getabi&address={contract_address}&apikey={self.api_key}"
        
        try:
            headers = {'Content-Type': 'application/json'}
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req) as response:
                return response.read().decode('utf-8')
        except urllib.error.URLError as e:
            raise

    def get_implementation_address(self, contract_address: str) -> Optional[str]:
        logger.info(f"Looking up proxy implementation for {contract_address}")
        
        url = f"https://{self.base_url}/api?module=proxy&action=eth_getStorageAt&address={contract_address}&position={Config.IMPLEMENTATION_SLOT}&tag=latest&apikey={self.api_key}"
        
        try:
            headers = {'Content-Type': 'application/json'}
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode('utf-8'))
            
            if not data.get('result'):
                return None
                
            storage_value = data['result']
            impl_hex = storage_value[26:]
            implementation = f"0x{impl_hex.lower().zfill(40)}"
            
            if implementation == "0x" + "0" * 40:
                return None
                
            logger.info(f"Found proxy implementation: {implementation}")
            return implementation
            
        except (urllib.error.URLError, json.JSONDecodeError) as e:
            raise

class SecretsManager:
    def __init__(self):
        self.client = boto3.client('secretsmanager')
        
    def get_network_api_key(self, network: str) -> str:
        if network not in Config.API_KEY_MAPPING:
            raise ValueError(f"Unsupported network: {network}")
            
        secret_response = self.client.get_secret_value(
            SecretId=os.environ.get('SECRET_ARN')
        )
        secrets = json.loads(secret_response['SecretString'])
        return secrets[Config.API_KEY_MAPPING[network]]

def handler(event, _):
    try:
        logger.info(f"Processing request for network: {event.get('queryStringParameters', {}).get('network')}")
        
        # Validate input
        params = event.get('queryStringParameters', {})
        network = params.get('network')
        contract_address = params.get('address')
        
        if not all([network, contract_address]):
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'message': 'Both network and contract address are required'
                })
            }
        
        # Initialize services
        secrets_mgr = SecretsManager()
        api_key = secrets_mgr.get_network_api_key(network)
        etherscan = EtherscanClient(api_key, network)
        
        # Get ABI (with proxy implementation check)
        try:
            impl_address = etherscan.get_implementation_address(contract_address)
            address_to_use = impl_address or contract_address
            response = etherscan.get_abi(address_to_use)
            response_data = json.loads(response)
            
            return {
                'statusCode': 200,
                'body': response_data['result']
            }
            
        except Exception as e:
            logger.error(f"Failed to fetch ABI: {str(e)}")
            return {
                'statusCode': 500,
                'body': json.dumps({
                    'message': 'Error processing request',
                    'error': str(e)
                })
            }
            
    except Exception as error:
        logger.error(f"Error: {str(error)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': 'Error processing request',
                'error': str(error)
            })
        } 