import React from "react";
import { Stack } from "@mantine/core";
import { WizardSelectLibraryStyle } from "@repo/ui";
import { useRouter } from "next/router";

const LibraryWizardPage = () => {
  const router = useRouter();
  const redirect = () => router.push("/search");

  return (
    <Stack>
      <WizardSelectLibraryStyle onSkip={redirect} onClose={redirect} />
    </Stack>
  );
};

export default LibraryWizardPage;
