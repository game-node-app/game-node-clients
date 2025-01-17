export type ConnectionCreateDto = {
    type: ConnectionCreateDto.type;
    /**
     * A string representing a username, user id or profile URL for the target connection <br>
     * e.g. a Steam's profile URL
     */
    userIdentifier: string;
    isImporterEnabled: boolean;
    isPlaytimeImportEnabled: boolean;
};
export declare namespace ConnectionCreateDto {
    enum type {
        STEAM = "steam",
        PSN = "psn"
    }
}
//# sourceMappingURL=ConnectionCreateDto.d.ts.map