import {
  Badge,
  Button,
  Code,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { ExternalGameService } from "@repo/wrapper/server";
import { IconWand } from "@tabler/icons-react";
import { getErrorMessage } from "@repo/ui";

const STATE_COLORS: Record<string, string> = {
  active: "blue",
  waiting: "yellow",
  delayed: "yellow",
  completed: "teal",
  failed: "red",
};

const EpicNamespaceFillPanel = () => {
  const fillMutation = useMutation({
    mutationFn: async () =>
      // shortcut: Swagger has no response schema for fill/epic, add an ApiResponse DTO on the server and regenerate
      (await ExternalGameService.externalGameControllerFillEpicNamespacesV1()) as {
        jobId: string;
        state: string;
      },
  });
  const job = fillMutation.data;
  const inProgress = job?.state === "active" || job?.state === "waiting";

  return (
    <Paper withBorder p="md">
      <Group align="flex-start" wrap="nowrap">
        <ThemeIcon variant="light" size="lg">
          <IconWand />
        </ThemeIcon>
        <Stack gap="xs">
          <Text fw={600}>Epic namespace fill</Text>
          <Text c="dimmed" size="sm">
            Registers every known Epic Games namespace as an unmapped external
            game so it can be matched below. Safe to run again at any time.
          </Text>
          <Group>
            <Button
              loading={fillMutation.isPending}
              onClick={() => fillMutation.mutate()}
            >
              Run Epic namespace fill
            </Button>
            {job && (
              <>
                <Badge color={STATE_COLORS[job.state]}>{job.state}</Badge>
                <Code>{job.jobId}</Code>
              </>
            )}
          </Group>
          {inProgress && <Text size="sm">A run is already in progress.</Text>}
          {fillMutation.error && (
            <Text c="red" size="sm">
              {getErrorMessage(fillMutation.error)}
            </Text>
          )}
        </Stack>
      </Group>
    </Paper>
  );
};

export { EpicNamespaceFillPanel };
