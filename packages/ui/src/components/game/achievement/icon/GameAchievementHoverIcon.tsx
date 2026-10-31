import { useOnMobile } from "#@/components";
import { cn } from "#@/util";
import {
  HoverCard,
  Image,
  ImageProps,
  Popover,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { GameAchievementWithObtainedInfo } from "@repo/wrapper/server";
import dayjs from "dayjs";

interface Props extends Omit<ImageProps, "src" | "alt"> {
  achievement: GameAchievementWithObtainedInfo;
}

const GameAchievementHoverIcon = ({ achievement, ...others }: Props) => {
  const onMobile = useOnMobile();
  const TargetElement = onMobile ? Popover : HoverCard;

  return (
    <TargetElement openDelay={500}>
      <TargetElement.Target>
        <Image
          {...others}
          src={achievement.iconUrl}
          alt={achievement.name}
          className={cn("w-12 h-12", others.className)}
        />
      </TargetElement.Target>
      <TargetElement.Dropdown className={"max-w-60 lg:max-w-96"}>
        <Stack>
          <Title order={5}>{achievement.name}</Title>
          <Text className={"text-dimmed"}>{achievement.description}</Text>
          {achievement.isObtained && (
            <Text className={"mt-2 text-dimmed text-sm"}>
              Obtained at {dayjs(achievement.obtainedAt).format("LLL")}
            </Text>
          )}
        </Stack>
      </TargetElement.Dropdown>
    </TargetElement>
  );
};

export { GameAchievementHoverIcon };