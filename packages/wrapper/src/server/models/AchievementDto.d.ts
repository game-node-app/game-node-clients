export type AchievementDto = {
    id: string;
    name: string;
    description: string;
    expGainAmount: number;
    category: AchievementDto.category;
};
export declare namespace AchievementDto {
    enum category {
        '_0' = 0,
        '_1' = 1,
        '_2' = 2,
        '_3' = 3,
        '_4' = 4
    }
}
//# sourceMappingURL=AchievementDto.d.ts.map