export type UserConnectionDto = {
    isImporterViable: boolean;
    isImporterWatchViable: boolean;
    isPlaytimeImportViable: boolean;
    id: number;
    type: UserConnectionDto.type;
    profileUserId: string;
    sourceUserId: string;
    sourceUsername: string;
    isImporterEnabled: boolean;
    isPlaytimeImportEnabled: boolean;
};
export declare namespace UserConnectionDto {
    enum type {
        STEAM = "steam",
        PSN = "psn"
    }
}
//# sourceMappingURL=UserConnectionDto.d.ts.map