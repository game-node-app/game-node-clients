import React from "react";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import AchievementsGrantView from "@/components/achievement/view/AchievementsGrantView";

const Page = () => {
    return (
        <PageContainer title={"Grant achievements"}>
            <AchievementsGrantView />
        </PageContainer>
    );
};

export default Page;
