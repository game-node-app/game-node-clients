/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type FindAvailableConnectionsResponseDto = {
    name: string;
    type: FindAvailableConnectionsResponseDto.type;
    /**
     * If this connection can be used by the importer system to import games
     * e.g.: Steam, PSN
     */
    isImporterViable: boolean;
    /**
     * If this connection can be used by the importer watch system to periodically
     * check for new importable games
     * e.g.: Steam
     */
    isImporterWatchViable: boolean;
    iconName: string;
};
export namespace FindAvailableConnectionsResponseDto {
    export enum type {
        STEAM = 'steam',
        PSN = 'psn',
    }
}

