import type { Profile } from './Profile';
export type ObtainedAchievement = {
    id: number;
    /**
     * Achievement id specified in entries for achievements.data.ts
     */
    achievementId: string;
    profile: Profile;
    profileUserId: string;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
};
//# sourceMappingURL=ObtainedAchievement.d.ts.map