export const NETWORK_SELECTOR_ID = 'network-selector';
export const SAFE_ADDRESS_INPUT_ID = 'safe-address-input';
export const SAFE_VERSION_SELECTOR_ID = 'safe-version-selector';
export const NONCE_INPUT_ID = 'nonce-input';
export const DATA_INPUT_ID = 'data-input';
export const TO_ADDRESS_INPUT_ID = 'to-address-input';
export const VALUE_INPUT_ID = 'value-input';
export const OPERATION_SELECTOR_ID = 'operation-selector';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const DEFAULT_SAFE_VERSION = '1.3.0';
export const SUPPORTED_SAFE_VERSIONS = ['1.0.0', '1.1.1', '1.2.0', '1.3.0', '1.4.1'];

export const OPERATION_TYPES = [
    { value: '0', label: 'Call' },
    { value: '1', label: 'Delegate Call' },
    { value: '2', label: 'Create' },
] as const;

export const LOADING_MESSAGE = 'Calculating hashes...';
export const ERROR_MESSAGE = 'An error occurred while calculating hashes';
export const SUCCESS_MESSAGE = 'Hashes calculated successfully'; 