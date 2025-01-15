/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateAchievementCodeRequestDto } from '../models/CreateAchievementCodeRequestDto';
import type { CreateAchievementCodeResponseDto } from '../models/CreateAchievementCodeResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AchievementsCodeService {
    /**
     * @param code
     * @returns any
     * @throws ApiError
     */
    public static achievementsCodeControllerConsumeV1(
        code: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/achievements/code/consume/{code}',
            path: {
                'code': code,
            },
        });
    }
    /**
     * @param requestBody
     * @returns CreateAchievementCodeResponseDto
     * @throws ApiError
     */
    public static achievementsCodeControllerGenerateV1(
        requestBody: CreateAchievementCodeRequestDto,
    ): CancelablePromise<CreateAchievementCodeResponseDto> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/achievements/code/generate',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
