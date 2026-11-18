import React from "react";
import { useRouter } from "next/router";
import { Container, Paper } from "@mantine/core";
import {
  CenteredLoading,
  ProfileReviewListView,
  useUserProfile,
  DetailsBox,
} from "@repo/ui";
import { useTranslation } from "@repo/locales";
import { ProfileOpenGraph } from "@/components/general/ProfileOpenGraph";
import { getSeoProfileProps, SeoProfileProps } from "@/util/seo";

export const getServerSideProps = getSeoProfileProps();

const Index = ({ seoProfile }: SeoProfileProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { userId } = router.query;

  const profileQuery = useUserProfile(userId as string);
  const username = profileQuery.data?.username;
  const openGraph = (
    <ProfileOpenGraph
      profile={seoProfile}
      title={t("seo.reviews.title", { username: seoProfile?.username })}
      description={t("seo.reviews.description", {
        username: seoProfile?.username,
      })}
    />
  );
  if (profileQuery.isLoading) {
    return (
      <>
        {openGraph}
        <CenteredLoading className={"mt-4"} />
      </>
    );
  }
  return (
    <Container
      fluid
      mih={"100%"}
      className={"flex flex-wrap justify-center"}
      p={0}
    >
      {openGraph}
      <Paper
        w={{
          base: "100%",
          lg: "80%",
        }}
      >
        <DetailsBox title={`${username}'s Reviews`}>
          <ProfileReviewListView userId={userId as string} />
        </DetailsBox>
      </Paper>
    </Container>
  );
};

export default Index;
