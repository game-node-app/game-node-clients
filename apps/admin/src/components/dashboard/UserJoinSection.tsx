import React from "react";
import { Card, Title } from "@mantine/core";
import UserJoinPeriodChart from "@/components/charts/UserJoinPeriodChart";

const sectionStyle = {
  padding: "var(--mantine-spacing-md)",
  borderTop:
    "1px solid lightdark(var(--mantine-colors-gray-3), var(--mantine-colors-dark-4))",
};

const UserJoinSection = () => {
  return (
    <Card radius={"md"}>
      <Card.Section style={sectionStyle}>
        <Title order={5}>Users by join period</Title>
      </Card.Section>
      <Card.Section style={sectionStyle}>
        <UserJoinPeriodChart />
      </Card.Section>
    </Card>
  );
};

export default UserJoinSection;
