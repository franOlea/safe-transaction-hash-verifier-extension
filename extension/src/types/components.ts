import { FormData, OnlineFormData, OfflineFormData } from './form';

export interface BaseCalculatorFormProps<T extends FormData, M extends 'online' | 'offline'> {
    onSubmitData: (data: T, formMode: M) => Promise<void>;
    extractedSafeAddress: string | null;
    extractedNetwork: string | null;
    onAddressSet: () => void;
    onNetworkSet: () => void;
}

export type OnlineCalculatorFormProps = BaseCalculatorFormProps<OnlineFormData, 'online'>;
export type OfflineCalculatorFormProps = BaseCalculatorFormProps<OfflineFormData, 'offline'>; 