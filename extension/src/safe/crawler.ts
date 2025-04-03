/**
 * Extracts the Ethereum address from a Safe app URL
 * @param url The URL to extract from (if not provided, uses current window location)
 * @returns The Ethereum address if found, otherwise null
 */
export function extractEthereumAddressFromSafeUrl(url: string): string | null {
    if (!url.startsWith('https://app.safe.global/')) {
        console.log('Not a Safe app URL: ', url);
        return null;
    }
    console.log('Extracting Ethereum address from Safe URL: ', url);

    const urlObj = new URL(url);

    // Check if the 'safe' parameter exists in the query string
    const safeParam = urlObj.searchParams.get('safe');
    if (safeParam) {
        // Extract the Ethereum address after the colon (e.g., "sep:0x0275E1208A4973bDC8D557C35637577b3447458A")
        const parts = safeParam.split(':');
        if (parts.length > 1) {
            return parts[parts.length - 1];
        }
        // Handle case where there's no prefix like "sep:"
        if (safeParam.startsWith('0x')) {
            return safeParam;
        }
    }

    // If no address found in query params, try to extract from pathname
    // Some Safe URLs might have the address in the path instead
    const pathSegments = urlObj.pathname.split('/');
    for (const segment of pathSegments) {
        if (segment.startsWith('0x') && segment.length >= 42) {
            return segment;
        }
    }

    return null;
}