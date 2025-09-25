import React, { PropsWithChildren } from "react";
import { Box, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import { AwardsEventLogo } from "#@/components/awards/view/AwardsEventLogo.tsx";
import { UserAvatarGroup } from "#@/components";

interface Props extends PropsWithChildren {
  userId: string;
  title: string;
}

const AwardsVoteLayout = ({ userId, title, children }: Props) => {
  return (
    <Stack
      className={
        "w-full min-h-screen bg-cover bg-[#1B1B1B] z-10 relative pb-32 lg:pb-20"
      }
    >
      <Group
        className={
          "w-full lg:flex-nowrap justify-center lg:justify-start px-6 pt-4"
        }
      >
        <Group className={"flex-nowrap gap-4 lg:w-96"}>
          <AwardsEventLogo />
          <Box className={"w-0.5 h-8 bg-brand-5"} />
          <Text className={"text-white text-sm"}>{title}</Text>
        </Group>
        <Group className={"flex-nowrap gap-4 lg:ms-auto lg:w-96 justify-end"}>
          <Box className={"max-w-56"}>
            <UserAvatarGroup userId={userId} />
          </Box>
          <UnstyledButton>
            <Text className={"text-white text-sm"}>Share</Text>
          </UnstyledButton>
        </Group>
      </Group>
      {children}
      <Group
        className={"w-full justify-between items-end absolute bottom-0 z-[-1]"}
      >
        <svg
          width="209"
          height="222"
          viewBox="0 0 209 222"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g opacity="0.36">
            <path
              d="M177.954 33.8266C179.575 33.8266 180.888 32.5131 180.888 30.8927C180.888 29.2724 179.575 27.9589 177.954 27.9589C176.334 27.9589 175.021 29.2724 175.021 30.8927C175.021 32.5131 176.334 33.8266 177.954 33.8266Z"
              fill="#882020"
            />
            <path
              d="M178.982 29.8624L126.549 64.0233L144.821 82.2953L178.982 29.8624Z"
              fill="#882020"
            />
            <path
              d="M177.954 33.8266C179.575 33.8266 180.888 32.5131 180.888 30.8927C180.888 29.2724 179.575 27.9589 177.954 27.9589C176.334 27.9589 175.021 29.2724 175.021 30.8927C175.021 32.5131 176.334 33.8266 177.954 33.8266Z"
              fill="#2C2C2C"
            />
            <path
              d="M178.982 29.8624L126.549 64.0233L144.821 82.2953L178.982 29.8624Z"
              fill="#2C2C2C"
            />
            <path
              d="M60.4704 115.039L122.453 53.0568L155.788 86.3923L93.8059 148.374C84.6006 157.58 69.6756 157.58 60.4704 148.374C51.2651 139.169 51.2651 124.244 60.4704 115.039Z"
              fill="#2C2C2C"
            />
            <path
              d="M100.912 141.263L90.2271 151.949C81.0218 161.154 66.0965 161.154 56.8917 151.949C52.2892 147.346 49.9877 141.314 49.9873 135.281C49.9877 129.248 52.2888 123.216 56.8917 118.613L67.5768 107.928C62.9744 112.53 60.6729 118.563 60.6725 124.596C60.6729 130.628 62.974 136.661 67.5768 141.263C76.7816 150.469 91.707 150.469 100.912 141.263Z"
              fill="#2C2C2C"
            />
            <path
              d="M199.446 90.3553L118.488 9.39697C96.1317 31.7529 96.1317 67.9994 118.488 90.3553C140.844 112.711 177.09 112.711 199.446 90.3553Z"
              fill="#222222"
            />
            <path
              d="M99.7971 117.421C104.42 117.421 108.167 113.673 108.167 109.05C108.167 104.427 104.42 100.68 99.7971 100.68C95.1743 100.68 91.4268 104.427 91.4268 109.05C91.4268 113.673 95.1743 117.421 99.7971 117.421Z"
              fill="#222222"
            />
            <path
              d="M115.992 132.57L137.471 154.054L115.001 176.49L93.5371 155.026L115.992 132.57Z"
              fill="#222222"
            />
            <path
              d="M162.703 128.861L139.099 152.425V152.43L117.614 130.946L141.204 107.356L162.703 128.861Z"
              fill="#222222"
            />
            <path
              d="M139.105 155.685L160.837 177.422L138.367 199.857L115 176.49L116.63 178.115L139.1 155.685H139.105Z"
              fill="#222222"
            />
            <path
              d="M186.065 152.226L162.461 175.79V175.796L140.724 154.059V154.054L164.328 130.489L186.065 152.226Z"
              fill="#222222"
            />
            <path
              d="M162.475 179.052L182.765 199.347L160.295 221.782L138.37 199.858L140 201.482L162.47 179.052H162.475Z"
              fill="#222222"
            />
            <path
              d="M207.999 174.151L184.395 197.716V197.721L164.1 177.426V177.421L187.704 153.851L207.999 174.151Z"
              fill="#222222"
            />
            <path
              d="M-11 47.6288L11.4651 25.1982H11.4699L33.2067 46.9351L10.7369 69.3704"
              fill="#222222"
            />
            <path
              d="M58.436 21.7413L34.832 45.306L13.0947 23.5692L36.6944 -0.000244141L58.436 21.7413Z"
              fill="#222222"
            />
            <path
              d="M80.37 43.6659L56.7661 67.2307L36.4707 46.9353L60.0699 23.3658L80.37 43.6659Z"
              fill="#222222"
            />
            <path
              d="M34.291 92.9212L56.7562 70.4858L77.7302 91.4599L55.2802 113.915"
              fill="#222222"
            />
            <path
              d="M12.3701 70.9971L34.8353 48.5618L55.1354 68.8623L32.6655 91.2925"
              fill="#222222"
            />
            <path
              d="M102.949 66.2469L79.3644 89.8315L58.3955 68.8626L81.9948 45.2927L102.949 66.2469Z"
              fill="#222222"
            />
            <path
              d="M179.604 2.8316C186.971 1.40524 194.891 3.54481 200.596 9.24938L200.286 8.93941C205.99 14.644 208.13 22.5641 206.704 29.9307"
              stroke="#2C2C2C"
              strokeWidth="3"
              strokeMiterlimit="10"
            />
          </g>
        </svg>
        <svg
          width="76"
          height="117"
          viewBox="0 0 76 117"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="38" width="38" height="117" fill="#F15025" />
          <rect y="54" width="38" height="63" fill="#212121" />
        </svg>
      </Group>
    </Stack>
  );
};

export { AwardsVoteLayout };
