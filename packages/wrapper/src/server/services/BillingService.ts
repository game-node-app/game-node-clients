/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BillingCheckoutResponseDto } from '../models/BillingCheckoutResponseDto';
import type { BillingMeResponseDto } from '../models/BillingMeResponseDto';
import type { BillingOffersResponseDto } from '../models/BillingOffersResponseDto';
import type { BillingPortalResponseDto } from '../models/BillingPortalResponseDto';
import type { BillingSubscriptionActionResponseDto } from '../models/BillingSubscriptionActionResponseDto';
import type { CheckoutRequestDto } from '../models/CheckoutRequestDto';
import type { PortalRequestDto } from '../models/PortalRequestDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BillingService {
    /**
     * @returns BillingOffersResponseDto
     * @throws ApiError
     */
    public static billingControllerGetOffersV1(): CancelablePromise<BillingOffersResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/billing/offers',
        });
    }
    /**
     * @param requestBody
     * @returns BillingCheckoutResponseDto
     * @throws ApiError
     */
    public static billingControllerCreateCheckoutV1(
        requestBody: CheckoutRequestDto,
    ): CancelablePromise<BillingCheckoutResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/billing/checkout',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns BillingMeResponseDto
     * @throws ApiError
     */
    public static billingControllerGetMeV1(): CancelablePromise<BillingMeResponseDto> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/billing/me',
        });
    }
    /**
     * @param requestBody
     * @returns BillingPortalResponseDto
     * @throws ApiError
     */
    public static billingControllerCreatePortalV1(
        requestBody: PortalRequestDto,
    ): CancelablePromise<BillingPortalResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/billing/portal',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns BillingSubscriptionActionResponseDto
     * @throws ApiError
     */
    public static billingControllerCancelV1(): CancelablePromise<BillingSubscriptionActionResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/billing/cancel',
        });
    }
    /**
     * @returns BillingSubscriptionActionResponseDto
     * @throws ApiError
     */
    public static billingControllerRestoreV1(): CancelablePromise<BillingSubscriptionActionResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/billing/restore',
        });
    }
}
