import { SignInScreen } from "@repo/ui";

export default function Auth() {
  return <SignInScreen homePath={"/home"} newUserPath={"/wizard/init"} />;
}
