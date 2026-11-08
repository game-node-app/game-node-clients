/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BillingMeResponseDto = {
    isSupporter: boolean;
    status: string | null;
    plan: string | null;
    billingInterval: string | null;
    periodEnd: string | null;
    cancelAtPeriodEnd: boolean | null;
    /**
     * Start of the current continuous subscription; null unless isSupporter.
     */
    supporterSince: string | null;
};

