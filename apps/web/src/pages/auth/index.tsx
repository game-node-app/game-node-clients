import Head from "next/head";
import { SignInScreen } from "@repo/ui";

export default function Auth() {
  return (
    <div className="oauth-private">
      <Head>
        <meta name="referrer" content="no-referrer" />
      </Head>
      <SignInScreen homePath={"/home"} newUserPath={"/wizard/init"} />
    </div>
  );
}
