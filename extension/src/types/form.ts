import { z } from "zod";

export const formSchema = z.object({
    mode: z.enum(["online", "offline"]),
});

export type FormValues = z.infer<typeof formSchema>;

export interface OnlineFormData {
    network: string;
    safeAddress: string;
    safeVersion: string;
    nonce: string;
}

export interface OfflineFormData extends OnlineFormData {
    data: string;
    to: string;
    value: string;
    operation: string;
}

export type FormData = OnlineFormData | OfflineFormData; 