import React from "react";
import { Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import ActivitiesByPeriodChart from "@/components/charts/ActivitiesByPeriodChart";

const sectionStyle = {
    padding: "var(--mantine-spacing-md)",
    borderTop:
        "1px solid lightdark(var(--mantine-colors-gray-3), var(--mantine-colors-dark-4))",
};

const ActivitySection = () => {
    return (
        <Card radius={"md"}>
            <Card.Section style={sectionStyle}>
                <Stack gap={1}>
                    <Title order={5}>Activity</Title>
                    <Text fz="sm" c="dimmed" fw="500">
                        Activities include most actions performed by users,
                        e.g.: adding a game to a collection, creating a review,
                        following a user, etc.
                    </Text>
                </Stack>
            </Card.Section>
            <Card.Section style={sectionStyle}>
                <ActivitiesByPeriodChart></ActivitiesByPeriodChart>
            </Card.Section>
            <Card.Section style={sectionStyle}>
                <a target={"_blank"} href={"https://matomo.gamenode.app"}>
                    <Button
                        variant={"outline"}
                        size={"sm"}
                        rightSection={<IconExternalLink />}
                    >
                        WebAnalytics
                    </Button>
                </a>
            </Card.Section>
        </Card>
    );
};

export default ActivitySection;
