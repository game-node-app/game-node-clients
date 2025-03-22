import React from "react";
import { useRouter } from "next/router";
import { Flex, Paper } from "@mantine/core";
import { ImporterScreen } from "@repo/ui";
import { SessionAuth } from "supertokens-auth-react/recipe/session";

function TypePage() {
  const router = useRouter();
  const { type } = router.query;

  return (
    <SessionAuth>
      <Flex justify={"center"} mih={"100vh"} p={0} wrap={"wrap"}>
        <Paper className={"w-full p-4"}>
          <ImporterScreen source={type as string} />
        </Paper>
      </Flex>
    </SessionAuth>
  );
}

export default TypePage;
