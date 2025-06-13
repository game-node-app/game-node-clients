import React from "react";
import {
  DetailsBox,
  ProfileStatsDataIcon,
  ProfileStatsDistributionBarByType,
  ProfileStatsDistributionLineByYear,
  ProfileStatsDistributionRadarByType,
  ProfileStatsView,
  useProfileMetricsOverview,
  UserAvatarWithLevelInfo,
} from "@repo/ui";
import { Box, Container, Group, Paper, SimpleGrid } from "@mantine/core";
import {
  IconClock,
  IconDeviceGamepad2,
  IconListCheck,
  IconStack2,
} from "@tabler/icons-react";
import { BarChart } from "@mantine/charts";
import { useRouter } from "next/router";

const ProfileStatsPage = () => {
  const router = useRouter();
  const { userId } = router.query;

  return <ProfileStatsView userId={userId as string} />;
};

export default ProfileStatsPage;
