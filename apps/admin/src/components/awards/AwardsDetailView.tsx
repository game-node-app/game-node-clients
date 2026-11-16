import { AwardsCategorySuggestionView } from "@/components/awards/AwardsCategorySuggestionView.tsx";
import { CreateUpdateAwardsCategoryForm } from "@/components/awards/form/CreateUpdateAwardsCategoryForm.tsx";
import { useCustomTable } from "@/components/table/hooks/use-custom-table.ts";
import {
  ActionIcon,
  Badge,
  Button,
  Flex,
  Group,
  Modal,
  Stack,
  Title,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  CenteredLoading,
  useAwardEvent,
  useAwardEventCategories,
} from "@repo/ui";
import {
  AwardsCategoryTranslationDto,
  VotableAwardsCategoryDto,
} from "@repo/wrapper/server";
import { IconDeviceGamepad2, IconEdit } from "@tabler/icons-react";
import { MantineReactTable, MRT_ColumnDef } from "mantine-react-table";
import { useMemo, useState } from "react";

const TRANSLATION_BADGES = [
  { label: "EN", locale: AwardsCategoryTranslationDto.locale.EN },
  { label: "PT", locale: AwardsCategoryTranslationDto.locale.PT_BR },
] as const;

const hasTranslation = (
  category: VotableAwardsCategoryDto,
  locale: AwardsCategoryTranslationDto["locale"],
) => {
  return (
    category.translations?.some(
      (translation) =>
        translation.locale === locale &&
        translation.name.trim().length > 0 &&
        translation.description.trim().length > 0,
    ) ?? false
  );
};

const COLUMNS: MRT_ColumnDef<VotableAwardsCategoryDto>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "translations",
    header: "Translations",
    Cell: ({ row }) => {
      return (
        <Group gap={4} wrap={"nowrap"}>
          {TRANSLATION_BADGES.map(({ label, locale }) => {
            const present = hasTranslation(row.original, locale);
            return (
              <Badge
                key={locale}
                size={"sm"}
                variant={present ? "light" : "filled"}
                color={present ? undefined : "gray"}
              >
                {label}
              </Badge>
            );
          })}
        </Group>
      );
    },
  },
  {
    accessorKey: "order",
    header: "Ordering",
  },
  {
    accessorKey: "nomineeCount",
    header: "Nominees",
  },
  {
    header: "Nominees finalized",
    id: "nomineesFinalizedAt",
    accessorFn: (row) =>
      row.nomineesFinalizedAt
        ? new Date(row.nomineesFinalizedAt).toLocaleString("en-US")
        : "No",
  },
  {
    accessorKey: "isVotable",
    header: "Is currently votable",
    Cell: ({ row }) => {
      return row.original.isVotable ? "Yes" : "No";
    },
  },
];

interface Props {
  eventId: number;
}

const AwardsDetailView = ({ eventId }: Props) => {
  const {
    data: eventCategories,
    isLoading,
    isError,
  } = useAwardEventCategories(eventId);
  const { data: event } = useAwardEvent({ eventId });

  const [suggestionsModalOpened, suggestionsModalUtils] = useDisclosure();
  const [editingCategoryId, setEditingCategoryId] = useState<
    number | undefined
  >(undefined);

  const editingCategory = useMemo(() => {
    return eventCategories?.find(
      (category) => category.id === editingCategoryId,
    );
  }, [eventCategories, editingCategoryId]);

  const table = useCustomTable({
    data: eventCategories ?? [],
    columns: COLUMNS,
    enableEditing: true,
    state: {
      isLoading,
    },
    renderCreateRowModalContent: () => {
      return <CreateUpdateAwardsCategoryForm eventId={eventId} />;
    },
    renderEditRowModalContent: ({ row }) => {
      return (
        <CreateUpdateAwardsCategoryForm
          eventId={eventId}
          categoryId={row.original?.id}
        />
      );
    },
    renderTopToolbarCustomActions: ({ table }) => {
      return (
        <Button onClick={() => table.setCreatingRow(true)}>
          Add new category
        </Button>
      );
    },
    renderRowActions: ({ table, row }) => {
      return (
        <Flex gap="md">
          <Tooltip label={"Edit category"}>
            <ActionIcon onClick={() => table.setEditingRow(row)}>
              <IconEdit />
            </ActionIcon>
          </Tooltip>
          <Tooltip label={"Add/remove nominees"}>
            <ActionIcon
              onClick={() => {
                setEditingCategoryId(row.original.id);
                suggestionsModalUtils.open();
              }}
            >
              <IconDeviceGamepad2 />
            </ActionIcon>
          </Tooltip>
        </Flex>
      );
    },
  });

  if (isLoading) return <CenteredLoading />;
  return (
    <Stack>
      <Group justify={"space-between"} align={"center"}>
        <Title size={"h4"}>Categories</Title>
        {event && (
          <Badge variant={"light"}>{`Phase: ${event.phase}`}</Badge>
        )}
      </Group>
      <Modal
        opened={suggestionsModalOpened && editingCategory !== undefined}
        onClose={suggestionsModalUtils.close}
        keepMounted={false}
        title={"Suggested games"}
        size={"xl"}
      >
        <AwardsCategorySuggestionView category={editingCategory!} />
      </Modal>
      <MantineReactTable table={table} />
    </Stack>
  );
};

export { AwardsDetailView };
