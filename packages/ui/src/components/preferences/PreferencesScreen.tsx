import React, { useState } from "react";
import { Box, Divider, Flex, Group, Paper, Stack } from "@mantine/core";
import {
  PreferencesActiveCategory,
  PreferencesScreenSideBar,
} from "#@/components/preferences/PreferencesScreenSideBar";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { PreferencesScreenSelector } from "#@/components/preferences/PreferencesScreenSelector";
import { PreferencesConnectionsScreen } from "#@/components/preferences/categories/PreferencesConnectionsScreen";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { useRouter } from "#@/util";
import { PreferencesAccountScreen } from "#@/components";
import { SessionAuth } from "supertokens-auth-react/recipe/session";

interface Props {
  category: PreferencesActiveCategory;
}
const PreferencesScreen = ({ category }: Props) => {
  const router = useRouter();
  const onMobile = useOnMobile();

  const onCategoryChange = (category: PreferencesActiveCategory) => {
    if (router) {
      router.push(`/preferences/${category}`);
    }
  };

  const render = () => {
    switch (category) {
      case "connections":
        return <PreferencesConnectionsScreen />;
      case "account":
        return <PreferencesAccountScreen />;

      default:
        return <CenteredLoading />;
    }
  };

  return (
    <SessionAuth>
      <Stack className={"justify-center items-center w-full relative"}>
        <Paper className={"w-full lg:w-[90vw]  mt-8 relative"}>
          <Group
            wrap={"wrap"}
            h={"fit-content"}
            className={"w-full items-start wrap"}
            gap={0}
          >
            <Stack className={"w-full lg:w-1/5 lg:mt-12 lg:mb-12"}>
              {onMobile ? (
                <PreferencesScreenSelector
                  activeCategory={category}
                  onChange={onCategoryChange}
                />
              ) : (
                <PreferencesScreenSideBar
                  activeItem={category}
                  onChange={onCategoryChange}
                />
              )}
            </Stack>
            {!onMobile && <Divider orientation={"vertical"} />}
            <Stack className={"w-full h-full lg:w-9/12 lg:mt-4 lg:ms-4"}>
              {render()}
            </Stack>
          </Group>
        </Paper>
      </Stack>
    </SessionAuth>
  );
};

export { PreferencesScreen };
