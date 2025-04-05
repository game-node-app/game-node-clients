"use client";

import { useEffect, useState } from "react";
import { redirectToAuth } from "supertokens-auth-react";
import SuperTokens from "supertokens-auth-react/ui";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";
import { PasswordlessPreBuiltUI } from "supertokens-auth-react/recipe/passwordless/prebuiltui";

export default function Auth() {
	// if the user visits a page that is not handled by us (like /auth/random), then we redirect them back to the auth page.
	const [loaded, setLoaded] = useState(false);
	useEffect(() => {
		if (
			!SuperTokens.canHandleRoute([
				ThirdPartyPreBuiltUI,
				PasswordlessPreBuiltUI,
			])
		) {
			redirectToAuth({ redirectBack: false }).then();
		} else {
			setLoaded(true);
		}
	}, []);

	if (loaded) {
		return SuperTokens.getRoutingComponent([
			ThirdPartyPreBuiltUI,
			PasswordlessPreBuiltUI,
		]);
	}

	return null;
}
