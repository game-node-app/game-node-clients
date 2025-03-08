import React, { useEffect } from "react";
import { Container } from "@mantine/core";
import { useRouter } from "next/router";
import { CenteredLoading } from "@repo/ui";

const Index = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("/activity/all");
  }, [router]);
  return (
    <Container fluid p={0}>
      <CenteredLoading />
    </Container>
  );
};

export default Index;
