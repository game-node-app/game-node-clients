import { Table, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  DailyGuessFeedbackDto,
  DailySpecsColumnsDto,
} from "@repo/wrapper/server";

const SET_COLUMNS = [
  "platforms",
  "genres",
  "themes",
  "gameModes",
  "gameEngines",
  "companies",
  "perspectives",
] as const;

const MATCH_COLORS = { match: "teal", partial: "yellow", none: "red" };
const YEAR_ARROWS = { higher: " ↑", lower: " ↓" };

const matchStyle = (match: keyof typeof MATCH_COLORS) => ({
  backgroundColor: `var(--mantine-color-${MATCH_COLORS[match]}-light)`,
  color: `var(--mantine-color-${MATCH_COLORS[match]}-light-color)`,
});

interface Props {
  feedback: DailyGuessFeedbackDto[];
}

const DailySpecsTable = ({ feedback }: Props) => {
  const { t } = useTranslation();

  const renderCells = (columns: DailySpecsColumnsDto) => {
    const year = columns.releaseYear;
    const arrow = year.direction ? YEAR_ARROWS[year.direction] : "";
    return (
      <>
        {SET_COLUMNS.map((column) => (
          <Table.Td key={column} style={matchStyle(columns[column].match)}>
            {columns[column].values.join(", ") || "—"}
          </Table.Td>
        ))}
        <Table.Td style={matchStyle(columns.franchise.match)}>
          {t(`daily.specs.franchise.${columns.franchise.match}`)}
        </Table.Td>
        <Table.Td style={matchStyle(year.match)}>
          {`${year.value ?? "—"}${arrow}`}
        </Table.Td>
      </>
    );
  };

  return (
    <Table.ScrollContainer minWidth={960}>
      <Table withTableBorder withColumnBorders verticalSpacing={"xs"}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t("daily.specs.columns.game")}</Table.Th>
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
              <Table.Td>
                <Text size={"sm"} fw={600}>
                  {item.name ?? t("daily.results.skipped")}
                </Text>
              </Table.Td>
              {item.columns ? (
                renderCells(item.columns)
              ) : (
                <Table.Td colSpan={SET_COLUMNS.length + 2} />
              )}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

export { DailySpecsTable };
