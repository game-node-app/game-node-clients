import React, { ComponentProps } from "react";
import { OpenGraph } from "@/components/general/OpenGraph";
import { SeoProfile } from "@/util/seo";

type Props = Omit<
  ComponentProps<typeof OpenGraph>,
  "imageUrl" | "imageAlt" | "wideImage"
> & {
  profile: SeoProfile | null;
};

/**
 * `OpenGraph` of a page about a user: the profile's banner or avatar is the
 * preview image. Renders nothing when the profile couldn't be fetched, so the
 * defaults of `_app` stay.
 */
export const ProfileOpenGraph = ({ profile, ...props }: Props) => {
  if (!profile) return null;
  return (
    <OpenGraph
      imageUrl={profile.imageUrl}
      imageAlt={profile.username}
      wideImage={profile.wideImage}
      {...props}
    />
  );
};
