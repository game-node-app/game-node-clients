import React, { useState } from "react";
import { Button, Group, Paper, Select, Stack, Text } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createErrorNotification } from "@repo/ui";
import { AchievementsAdminService, SearchService } from "@repo/wrapper/server";

/** Read-only: simulating never changes any state. */
const SimulatePanel = ({ definitionId }: { definitionId: string }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const profilesQuery = useQuery({
    queryKey: ["achievement-simulation-users", search],
    queryFn: () =>
      SearchService.searchControllerSearchUsers0V1({
        query: search,
        limit: 20,
      }),
    enabled: search.trim().length >= 3,
  });

  const simulateMutation = useMutation({
    mutationFn: () =>
      AchievementsAdminService.achievementsAdminControllerSimulateDefinitionV1(
        definitionId,
        { userId: userId! },
      ),
    onError: createErrorNotification,
  });

  return (
    <Paper className={"!bg-[#181818] p-4"}>
      <Stack>
        <Text fw={500}>Simulate</Text>
        <Group align={"end"}>
          <Select
            className={"grow"}
            label={"User"}
            data={(profilesQuery.data?.data.items ?? []).map((item) => ({
              value: item.userId,
              label: item.username,
            }))}
            value={userId}
            onChange={setUserId}
            searchValue={search}
            onSearchChange={setSearch}
            searchable
            limit={20}
          />
          <Button
            disabled={!userId}
            loading={simulateMutation.isPending}
            onClick={() => simulateMutation.mutate()}
          >
            Simulate
          </Button>
        </Group>
        {simulateMutation.data && (
          <Text>
            Value: {simulateMutation.data.value}. Tier levels reached:{" "}
            {simulateMutation.data.levels.join(", ") || "none"}
          </Text>
        )}
      </Stack>
    </Paper>
  );
};

export { SimulatePanel };
