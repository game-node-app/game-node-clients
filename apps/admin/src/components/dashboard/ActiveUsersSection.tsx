import React from "react";
import { Card, Center, Text, Title } from "@mantine/core";
import { useUserProfiles } from "@/components/profile/hooks/useUserProfiles";
import CenteredLoading from "@/components/general/CenteredLoading";

const sectionStyle = {
  padding: "var(--mantine-spacing-md)",
  borderTop:
    "1px solid lightdark(var(--mantine-colors-gray-3), var(--mantine-colors-dark-4))",
};

const ActiveUsersSection = () => {
  const profilesQuery = useUserProfiles();

  return (
    <Card radius="md">
      <Card.Section style={sectionStyle}>
        <Title order={5}>Active Users</Title>
        <Text fz="sm" c="dimmed" fw="500">
          Only includes users with a registered profile
        </Text>
      </Card.Section>
      <Card.Section style={sectionStyle}>
        {profilesQuery.isLoading ? (
          <CenteredLoading message={"Loading..."} />
        ) : (
          <Center>
            <Title size={"h4"}>{profilesQuery.data?.length}</Title>
          </Center>
        )}
      </Card.Section>
    </Card>
  );
};

export default ActiveUsersSection;
