/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type HandleReportRequestDto = {
    action: HandleReportRequestDto.action;
    deleteReportedContent: boolean;
};
export namespace HandleReportRequestDto {
    export enum action {
        DISCARD = 'discard',
        ALERT = 'alert',
        SUSPEND = 'suspend',
        BAN = 'ban',
    }
}

