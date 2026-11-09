/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ProfileVideoUploadResponseDto = {
    status: ProfileVideoUploadResponseDto.status;
    errorCode: ProfileVideoUploadResponseDto.errorCode | null;
};
export namespace ProfileVideoUploadResponseDto {
    export enum status {
        PROCESSING = 'processing',
        READY = 'ready',
        FAILED = 'failed',
    }
    export enum errorCode {
        CONVERSION_FAILED = 'conversion_failed',
        OUTPUT_TOO_LARGE = 'output_too_large',
        UPLOAD_FAILED = 'upload_failed',
        SOURCE_MISSING = 'source_missing',
        TIMEOUT = 'timeout',
    }
}

