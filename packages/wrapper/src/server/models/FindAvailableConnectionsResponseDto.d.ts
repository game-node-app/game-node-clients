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
    isPlaytimeImportViable: boolean;
    iconName: string;
};
export declare namespace FindAvailableConnectionsResponseDto {
    enum type {
        STEAM = "steam",
        PSN = "psn"
    }
}
//# sourceMappingURL=FindAvailableConnectionsResponseDto.d.ts.map