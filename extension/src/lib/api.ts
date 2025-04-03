import { API_URLS } from "@/safe/config";
import { NetworkError } from "./errors";

const API_KEY = "eusCNT8iJ85sNM1KCYmdF75Yo3ye97pU3RtjGEdQ";
const BASE_URL = "https://9hk0f3a45c.execute-api.us-west-2.amazonaws.com/prod";

interface SafeTransactionResponse {
    results: Array<{
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
    }>;
}

export async function fetchSafeTransaction(network: string, address: string, nonce: number) {
    const apiUrl = API_URLS[network];
    if (!apiUrl) {
        throw new NetworkError(`Invalid network: ${network}`);
    }

    const response = await fetch(`${apiUrl}/api/v2/safes/${address}/multisig-transactions/?nonce=${nonce}`);
    if (!response.ok) {
        throw new NetworkError(`Failed to fetch transaction data: ${response.statusText}`);
    }

    const data: SafeTransactionResponse = await response.json();
    if (!data.results || data.results.length === 0) {
        throw new NetworkError(`No transaction found with nonce ${nonce}`);
    }

    return data.results[0];
}

export async function getABI(network: string, address: string): Promise<string> {
    const url = `${BASE_URL}/abi?network=${network}&address=${address}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'X-api-key': API_KEY
        },
        mode: 'cors',
        credentials: 'omit'
    });

    if (!response.ok) {
        throw new NetworkError(`Failed to fetch ABI: ${response.statusText}`);
    }

    const text = await response.text();

    return text;
}
