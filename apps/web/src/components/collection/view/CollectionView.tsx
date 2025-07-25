import React, { useEffect, useMemo } from "react";
import { Divider, Group, Skeleton, Stack, Text, Title } from "@mantine/core";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Head from "next/head";
import CollectionEntriesView from "@/components/collection/view/CollectionEntriesView";
import {
  CollectionViewActions,
  findCollectionEntryByGameId,
  useCollection,
  useCollectionEntriesForCollectionId,
  useGames,
  useUserId,
  useUserProfile,
} from "@repo/ui";

interface ICollectionViewProps {
  libraryUserId: string;
  collectionId: string;
}

const CollectionViewFormSchema = z.object({
  page: z.number().optional().default(1),
  orderBy: z.object({
    addedDate: z.literal("DESC").or(z.literal("ASC")).optional(),
    releaseDate: z.literal("DESC").or(z.literal("ASC")).optional(),
  }),
});

type CollectionViewFormValues = z.infer<typeof CollectionViewFormSchema>;

const DEFAULT_LIMIT = 10;

const DEFAULT_REQUEST_PARAMS = {
  limit: DEFAULT_LIMIT,
  offset: 0,
};

const CollectionView = ({
  collectionId,
  libraryUserId,
}: ICollectionViewProps) => {
  const { watch, setValue } = useForm<CollectionViewFormValues>({
    mode: "onSubmit",
    resolver: zodResolver(CollectionViewFormSchema),
    defaultValues: {
      page: 1,
      orderBy: {
        addedDate: "DESC",
      },
    },
  });

  const ownUserId = useUserId();

  const formPage = watch("page");
  const orderBy = watch("orderBy");

  const requestParams = useMemo(() => {
    const page = formPage || 1;
    const offset = (page - 1) * DEFAULT_LIMIT;
    return {
      ...DEFAULT_REQUEST_PARAMS,
      offset,
    };
  }, [formPage]);

  const collectionQuery = useCollection(collectionId);
  const collection = collectionQuery.data;
  const isOwnCollection = libraryUserId === ownUserId;
  const collectionEntriesQuery = useCollectionEntriesForCollectionId({
    collectionId,
    offset: requestParams.offset,
    limit: requestParams.limit,
    orderBy: orderBy,
  });
  const gamesIds = useMemo(() => {
    return collectionEntriesQuery.data?.data.map((entry) => entry.gameId);
  }, [collectionEntriesQuery.data]);
  const gamesQuery = useGames({
    gameIds: gamesIds,
    relations: {
      cover: true,
    },
  });
  const games = useMemo(() => {
    return gamesQuery.data?.map((game) => {
      const relatedCollectionEntry = findCollectionEntryByGameId(
        game.id,
        collectionEntriesQuery.data?.data,
      );

      return {
        ...game,
        href: `/library/${libraryUserId}/collection/entry/${relatedCollectionEntry?.id}`,
      };
    });
  }, [collectionEntriesQuery.data?.data, gamesQuery.data, libraryUserId]);

  const profileQuery = useUserProfile(ownUserId);
  const profile = profileQuery.data;

  const isLoading =
    collectionQuery.isLoading ||
    collectionEntriesQuery.isLoading ||
    gamesQuery.isLoading;
  const isError =
    collectionQuery.isError ||
    collectionEntriesQuery.isError ||
    gamesQuery.isError;

  useEffect(() => {
    // Resets page on collection change
    setValue("page", 1);
  }, [collectionId, setValue]);

  return (
    <Stack w={"100%"} h={"100%"} gap={0} align={"center"}>
      {collection && profile && (
        <Head>
          <title>{`${profile.username} - ${collection.name} - GameNode`}</title>
        </Head>
      )}
      <Group className="w-full mt-8 flex-nowrap justify-between">
        <Stack w={{ base: "70%", lg: "30%" }}>
          {isLoading && (
            <>
              <Skeleton className={"w-32 h-9"} />
              <Skeleton className={"w-48 h-6"} />
            </>
          )}
          <Title size={"h3"} className={"w-full break-words"}>
            {collection?.name}
          </Title>
          <Text c={"dimmed"} w={"100%"} className={"break-words"}>
            {collectionQuery.data?.description}
          </Text>
        </Stack>
        {!isError && !isLoading && isOwnCollection && (
          <CollectionViewActions
            libraryUserId={libraryUserId}
            collectionId={collectionId}
          />
        )}
      </Group>
      <Divider className={"w-full"} my={"sm"} variant={"dashed"} />
      <CollectionEntriesView
        isLoading={isLoading}
        isError={isError}
        games={games}
        paginationInfo={collectionEntriesQuery.data?.pagination}
        page={formPage}
        onPaginationChange={(page) => {
          setValue("page", page);
        }}
        onChangeOrder={(value, order) => {
          setValue("orderBy", {
            [value]: order,
          });
        }}
      />
    </Stack>
  );
};

export default CollectionView;
