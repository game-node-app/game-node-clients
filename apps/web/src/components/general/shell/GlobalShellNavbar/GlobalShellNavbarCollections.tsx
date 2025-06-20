import React from "react";
import classes from "./global-shell-navbar.module.css";
import GlobalShellNavbarCollectionsHeader from "@/components/general/shell/GlobalShellNavbar/GlobalShellNavbarCollectionsHeader";
import { Center, ScrollArea, Stack, Text } from "@mantine/core";
import { Collection } from "@repo/wrapper/server";
import Link from "next/link";
import { useSessionContext } from "supertokens-auth-react/recipe/session";
import { usePathname } from "next/navigation";
import { BaseModalChildrenProps, useUserLibrary } from "@repo/ui";
import clsx from "clsx";

interface IGlobalShellNavbarCollectionsProps extends BaseModalChildrenProps {}

const GlobalShellNavbarCollections = ({
  onClose,
}: IGlobalShellNavbarCollectionsProps) => {
  const pathname = usePathname();

  const session = useSessionContext();
  const isLoggedIn = !session.loading && session.doesSessionExist;

  const userLibraryQuery = useUserLibrary(
    session.loading ? undefined : session.userId,
  );
  const userLibrary = userLibraryQuery.data;

  const shouldBeHidden = pathname && pathname.startsWith("/library");

  const buildCollectionsLinks = () => {
    if (
      !isLoggedIn ||
      !userLibrary ||
      userLibrary.collections == null ||
      userLibrary.collections.length === 0
    ) {
      return (
        <Center>
          <Text c="dimmed" size="sm" mt="md">
            Your collections will show here 😉
          </Text>
        </Center>
      );
    }

    return userLibrary.collections.map((collection: Collection) => (
      <Link
        key={collection.id}
        href={`/library/${userLibrary.userId}/collection/${collection.id}`}
        onClick={onClose}
        className={classes.collectionLink}
      >
        <span>{collection.name}</span>
      </Link>
    ));
  };

  return (
    <div className={clsx(classes.section, "ps-6 pe-2")}>
      <GlobalShellNavbarCollectionsHeader />
      <ScrollArea className={"w-full"} mah={250}>
        <Stack gap="xs">{buildCollectionsLinks()}</Stack>
      </ScrollArea>
    </div>
  );
};

export default GlobalShellNavbarCollections;
