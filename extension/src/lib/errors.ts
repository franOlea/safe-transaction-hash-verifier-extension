export class SafeHashError extends Error {
    constructor(message: string, public code?: string) {
        super(message);
        this.name = 'SafeHashError';
    }
}

export class NetworkError extends SafeHashError {
    constructor(message: string) {
        super(message, 'NETWORK_ERROR');
    }
}

export class ValidationError extends SafeHashError {
    constructor(message: string) {
        super(message, 'VALIDATION_ERROR');
    }
}

export class TransactionError extends SafeHashError {
    constructor(message: string) {
        super(message, 'TRANSACTION_ERROR');
    }
}

export function handleError(error: unknown): SafeHashError {
    if (error instanceof SafeHashError) {
        return error;
    }

    if (error instanceof Error) {
        return new SafeHashError(error.message);
    }

    return new SafeHashError('An unknown error occurred');
} 