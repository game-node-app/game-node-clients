import Head from "next/head";
import { OAuthConsentScreen } from "@repo/ui";

export default function ConsentPage() {
  return (
    <>
      <Head>
        <meta name="referrer" content="no-referrer" />
      </Head>
      <OAuthConsentScreen />
    </>
  );
}
