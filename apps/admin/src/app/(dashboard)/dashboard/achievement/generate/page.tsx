import React from "react";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import AchievementsGenerateCodeView from "@/components/achievement/view/AchievementsGenerateCodeView";

const Page = () => {
    return (
        <PageContainer title={"Generate redeemable achievement code"}>
            <AchievementsGenerateCodeView />
        </PageContainer>
    );
};

export default Page;
