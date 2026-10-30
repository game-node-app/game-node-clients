import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import { I18nProvider } from "@repo/locales";
import { BlogPreviewDto } from "@repo/wrapper/server";
import { BlogArticleView, EUserRoles, useUserRoles } from "@repo/ui";
import { Text } from "@mantine/core";
import useUserId from "@/components/auth/hooks/useUserId";

export function getServerSideProps({ res }: GetServerSidePropsContext) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  return { props: {} };
}
export default function Preview() {
  const { query } = useRouter();
  const userId = useUserId();
  const roles = useUserRoles();
  const allowed = roles.some((role) =>
    [EUserRoles.ADMIN, EUserRoles.MOD, EUserRoles.EDITOR].includes(role),
  );
  const id = typeof query.postId === "string" ? query.postId : undefined;
  const locale =
    query.locale === "en" || query.locale === "pt-BR"
      ? query.locale
      : undefined;
  const key = JSON.stringify([userId, allowed, id, locale]);
  const [result, setResult] = useState<{
    key: string;
    post?: BlogPreviewDto;
    error?: boolean;
  }>();
  useEffect(() => {
    setResult(undefined);
    if (!userId || !allowed || !id || !locale) return;
    const controller = new AbortController();
    fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/blog/preview/${encodeURIComponent(id)}?locale=${locale}`,
      {
        credentials: "include",
        cache: "no-store",
        signal: controller.signal,
      },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error("Preview denied");
        const post: BlogPreviewDto = await response.json();
        if (!controller.signal.aborted) setResult({ key, post });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ key, error: true });
      });
    return () => controller.abort();
  }, [key, userId, allowed, id, locale]);
  return (
    <>
      <Head>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      {!userId || !allowed ? (
        <Text>Access denied</Text>
      ) : !locale ? (
        <Text>Select en or pt-BR.</Text>
      ) : result?.key === key && result.post ? (
        <I18nProvider language={locale}>
          <BlogArticleView post={result.post} />
        </I18nProvider>
      ) : (
        <Text role="status">
          {result?.key === key && result.error
            ? "Preview unavailable"
            : "Loading preview…"}
        </Text>
      )}
    </>
  );
}
