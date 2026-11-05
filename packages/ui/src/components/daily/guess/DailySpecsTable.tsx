import { Group, Paper, SimpleGrid, Table, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import {
  DailyGuessFeedbackDto,
  DailySpecsColumnsDto,
} from "@repo/wrapper/server";
import {
  DAILY_MATCH_KIND,
  DAILY_RESULT_STYLES,
} from "#@/components/daily/util/dailyModes";

const SET_COLUMNS = [
  "platforms",
  "genres",
  "themes",
  "gameModes",
  "gameEngines",
  "companies",
  "perspectives",
] as const;

type Match = keyof typeof DAILY_MATCH_KIND;

interface Cell {
  key: string;
  label: string;
  text: string;
  match: Match;
  /** Year only: where the answer is compared to the guess. */
  direction?: "higher" | "lower";
}

const matchStyle = (match: Match) => {
  const { color } = DAILY_RESULT_STYLES[DAILY_MATCH_KIND[match]];
  return {
    backgroundColor: `var(--mantine-color-${color}-light)`,
    color: `var(--mantine-color-${color}-light-color)`,
    border: `1px solid var(--mantine-color-${color}-filled)`,
    borderRadius: 6,
  };
};

const stickyStyle = {
  position: "sticky",
  left: 0,
  zIndex: 1,
  backgroundColor: "var(--mantine-color-dark-6)",
  borderRadius: 6,
} as const;

interface MatchContentProps {
  cell: Cell;
}

/** Icon plus text, so the result doesn't rely on the cell color alone. */
const MatchContent = ({ cell }: MatchContentProps) => {
  const { t } = useTranslation();
  const { icon: MatchIcon } = DAILY_RESULT_STYLES[DAILY_MATCH_KIND[cell.match]];
  const Arrow = cell.direction === "higher" ? IconArrowUp : IconArrowDown;

  return (
    <Group className={"gap-1.5 flex-nowrap items-start"}>
      <MatchIcon size={14} className={"shrink-0 mt-1"} aria-hidden />
      <span className={"sr-only"}>{t(`daily.specs.legend.${cell.match}`)}</span>
      <Text span size={"sm"}>
        {cell.text}
      </Text>
      {cell.direction && (
        <Arrow
          size={14}
          className={"shrink-0 mt-1"}
          role={"img"}
          aria-label={t(
            cell.direction === "higher"
              ? "daily.specs.newer"
              : "daily.specs.older",
          )}
        />
      )}
    </Group>
  );
};

interface Props {
  /** Newest first. */
  feedback: DailyGuessFeedbackDto[];
}

const DailySpecsTable = ({ feedback }: Props) => {
  const { t } = useTranslation();

  const toCells = (columns: DailySpecsColumnsDto): Cell[] => [
    ...SET_COLUMNS.map((column) => ({
      key: column,
      label: t(`daily.specs.columns.${column}`),
      text: columns[column].values.join(", ") || "—",
      match: columns[column].match as Match,
    })),
    {
      key: "franchise",
      label: t("daily.specs.columns.franchise"),
      text: t(`daily.specs.franchise.${columns.franchise.match}`),
      match: columns.franchise.match as Match,
    },
    {
      key: "releaseYear",
      label: t("daily.specs.columns.releaseYear"),
      text: `${columns.releaseYear.value ?? "—"}`,
      match: columns.releaseYear.match as Match,
      direction: columns.releaseYear.direction ?? undefined,
    },
  ];

  const name = (item: DailyGuessFeedbackDto) =>
    item.name ?? t("daily.results.skipped");

  return (
    <>
      <Group className={"gap-4"}>
        {(Object.keys(DAILY_MATCH_KIND) as Match[]).map((match) => {
          const { color, icon: LegendIcon } =
            DAILY_RESULT_STYLES[DAILY_MATCH_KIND[match]];
          return (
            <Group key={match} className={"gap-1.5"}>
              <LegendIcon
                size={14}
                color={`var(--mantine-color-${color}-filled)`}
              />
              <Text size={"xs"} c={"dimmed"}>
                {t(`daily.specs.legend.${match}`)}
              </Text>
            </Group>
          );
        })}
      </Group>

      <Table.ScrollContainer minWidth={960} className={"hidden md:block"}>
        {/* Separate, rounded cells like the comparison grid in the design. */}
        <Table
          verticalSpacing={"xs"}
          withRowBorders={false}
          style={{ borderCollapse: "separate", borderSpacing: 6 }}
          className={
            "rounded-[12px] border border-[var(--mantine-color-default-border)] !bg-paper-8"
          }
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={stickyStyle}>
                {t("daily.specs.columns.game")}
              </Table.Th>
              {SET_COLUMNS.map((column) => (
                <Table.Th key={column}>
                  {t(`daily.specs.columns.${column}`)}
                </Table.Th>
              ))}
              <Table.Th>{t("daily.specs.columns.franchise")}</Table.Th>
              <Table.Th>{t("daily.specs.columns.releaseYear")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {feedback.map((item, index) => (
              <Table.Tr key={index}>
                <Table.Td style={stickyStyle}>
                  <Text size={"sm"} fw={600}>
                    {name(item)}
                  </Text>
                </Table.Td>
                {item.columns ? (
                  toCells(item.columns).map((cell) => (
                    <Table.Td key={cell.key} style={matchStyle(cell.match)}>
                      <MatchContent cell={cell} />
                    </Table.Td>
                  ))
                ) : (
                  <Table.Td colSpan={SET_COLUMNS.length + 2} />
                )}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <div className={"flex flex-col gap-3 md:hidden"}>
        {feedback.map((item, index) => (
          <Paper key={index} withBorder p={"sm"}>
            <Text fw={600} mb={item.columns ? "xs" : 0}>
              {name(item)}
            </Text>
            {item.columns && (
              <SimpleGrid cols={2} spacing={"xs"}>
                {toCells(item.columns).map((cell) => (
                  <div
                    key={cell.key}
                    className={"rounded-sm p-2 min-w-0"}
                    style={matchStyle(cell.match)}
                  >
                    <Text size={"xs"} className={"opacity-80"}>
                      {cell.label}
                    </Text>
                    <MatchContent cell={cell} />
                  </div>
                ))}
              </SimpleGrid>
            )}
          </Paper>
        ))}
      </div>
    </>
  );
};

export { DailySpecsTable };
