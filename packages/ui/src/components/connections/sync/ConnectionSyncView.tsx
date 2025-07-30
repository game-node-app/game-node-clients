import React, { useEffect, useRef, useState } from "react";
import { Button, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { getCapitalizedText } from "#@/util";
import { UserConnectionDto } from "@repo/wrapper/server";
import { useUserId, useWebSocket } from "#@/components";
import type = UserConnectionDto.type;
import { Socket } from "socket.io-client";
import DisconnectReason = Socket.DisconnectReason;

interface Props {
  type: type;
}

const ConnectionSyncView = ({ type }: Props) => {
  const userId = useUserId();
  const [messages, setMessages] = useState<string[]>([]);
  const { socket, isConnected, error, on, off } =
    useWebSocket("connection-sync");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleMessage = (data: unknown) => {
    setMessages((prev) => [...prev, data as string]);
  };

  const handleConnect = () => {
    setMessages([
      "Connection ready. Click 'Start' below to sync this connection.",
    ]);
  };

  const handleError = (err: unknown) => {
    if (err instanceof Error) {
      setMessages([err.message, "Trying to reconnect..."]);
    }
  };

  useEffect(() => {
    if (!socket) return;

    on("message", handleMessage);
    on("connect", handleConnect);
    on("connect_err", handleError);

    return () => {
      off("message", handleMessage);
      off("connect", handleConnect);
      off("connect_err", handleError);
    };
  }, [off, on, socket]);

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
      <Text className={"text-dimmed text-sm"}>
        This will perform a update request in your library, fetching playtime
        info, check for newer games, etc.
      </Text>
      <Text className={"text-dimmed text-sm"}>
        Important: We already do this automatically. Use this to manually
        trigger a update or debug importing issues.
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
