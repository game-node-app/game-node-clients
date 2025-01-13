import { useRouter } from "next/router";
import AchievementsScreen from "@/components/achievement/AchievementsScreen";
import { useEffect } from "react";
import { Box, Center } from "@mantine/core";

export default function AchievementsPage() {
    const router = useRouter();
    const query = router.query;
    const targetUserId = query.targetUserId as string;
    return (
        <Center>
            <Box className={"w-full lg:w-10/12 h-full lg:min-h-screen"}>
                <AchievementsScreen targetUserId={targetUserId} />
            </Box>
        </Center>
    );
}
