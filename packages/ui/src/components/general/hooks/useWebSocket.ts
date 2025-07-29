import { io, Socket, SocketOptions } from "socket.io-client";
import { OpenAPI } from "@repo/wrapper/server";
import { useEffect, useRef, useState } from "react";
import Session from "supertokens-auth-react/recipe/session";

const SERVER_URL = OpenAPI.BASE;

export function useWebSocket(namespace: string = "/", opts?: SocketOptions) {
  const socketRef = useRef<Socket>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await Session.getAccessToken();

      const endpoint = namespace.startsWith("/") ? namespace : `/${namespace}`;

      socketRef.current = io(`${SERVER_URL}${endpoint}`, {
        transports: ["websocket"],
        query: {
          token: token,
        },
        ...opts,
      });

      socketRef.current.on("connect", () => {
        console.log(`Connected to socket in namespace ${namespace}`);
        setIsConnected(true);
      });

      socketRef.current.on("disconnect", () => {
        console.log(`Disconnected from socket in namespace ${namespace}`);
        setIsConnected(false);
      });

      socketRef.current.on("connect_error", (err) => {
        console.log(`Error connecting to socket in namespace ${namespace}`);
        console.error(err);
      });
    })();

    // Cleanup on unmounting
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      }
    };
  }, [namespace, opts]);

  const emit = (eventName: string, data: unknown) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(eventName, data);
    }
  };

  const on = (eventName: string, callback: (evt: unknown) => void) => {
    if (socketRef.current) {
      socketRef.current.on(eventName, callback);
    }
  };

  const off = (eventName: string) => {
    if (socketRef.current) {
      socketRef.current.off(eventName);
    }
  };

  return { socket: socketRef.current, isConnected, emit, on, off };
}
