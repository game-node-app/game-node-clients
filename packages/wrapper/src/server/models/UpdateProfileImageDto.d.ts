export type UpdateProfileImageDto = {
    type: UpdateProfileImageDto.type;
    file: Record<string, any>;
};
export declare namespace UpdateProfileImageDto {
    enum type {
        AVATAR = "avatar",
        BANNER = "banner"
    }
}
//# sourceMappingURL=UpdateProfileImageDto.d.ts.map