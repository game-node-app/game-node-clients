import React, { useEffect, useRef, useState } from "react";
import { Button, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { getCapitalizedText } from "#@/util";
import { UserConnectionDto } from "@repo/wrapper/server";
import { useUserId, useWebSocket } from "#@/components";
import type = UserConnectionDto.type;

interface Props {
  type: type;
}

const ConnectionSyncView = ({ type }: Props) => {
  const userId = useUserId();
  const [messages, setMessages] = useState<string[]>([]);
  const { socket, isConnected, on, off } = useWebSocket("connection-sync");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isConnected) {
      on("message", (data) => {
        setMessages((prev) => [...prev, data as string]);
      });
    }

    return () => {
      off("message");
    };
  }, [off, on, isConnected]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current!.scrollTo({
        top: scrollAreaRef.current!.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <Stack className={"h-full w-full"}>
      <Title size={"h4"}>Start sync job for {getCapitalizedText(type)}</Title>
      <Text className={"text-dimmed"}>
        This will perform a update request in your library, fetching playtime
        info, check for newer games, etc.
      </Text>
      <ScrollArea
        h={400}
        className={"bg-paper flex flex-col gap-2 p-2"}
        overscrollBehavior={"auto"}
        scrollbars={"y"}
        type={"always"}
        viewportRef={scrollAreaRef}
      >
        {messages.map((message, index) => (
          <Text key={`${index}-${message}`} className={"text-gray-300 text-sm"}>
            {message}
          </Text>
        ))}
      </ScrollArea>
      <Button
        onClick={() => {
          setMessages([]);
          socket?.emit("sync", {
            userId,
            type,
          });
        }}
      >
        Start
      </Button>
    </Stack>
  );
};

export { ConnectionSyncView };
