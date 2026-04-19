import { spotlight } from "@mantine/spotlight";
import { TGameOrSearchGame } from "@repo/ui";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type CommandCenterModal =
  | "preferredPlatforms"
  | "gameAddEditForm"
  | "gameRemoveForm";

interface CommandCenterModalState {
  modal: CommandCenterModal | null;
  payload: TGameOrSearchGame | null;
}

interface CommandCenterContextValue extends CommandCenterModalState {
  openModal: (
    modal: CommandCenterModal,
    payload: TGameOrSearchGame | null,
  ) => void;
  closeModal: () => void;
}

const CommandCenterContext = createContext<CommandCenterContextValue>({
  openModal: () => {},
  closeModal: () => {},
  modal: null,
  payload: null,
});

export const CommandCenterContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [modalState, setModalState] = useState<CommandCenterModalState | null>(
    null,
  );

  const closeModal = useCallback(() => {
    setModalState(null);
  }, []);

  const openModal = useCallback(
    (modal: CommandCenterModal, payload: TGameOrSearchGame | null) => {
      console.log("Opening modal:", modal, "with payload:", payload);
      spotlight.close();

      requestAnimationFrame(() => {
        setModalState({ modal, payload });
      });
    },
    [],
  );

  const value = useMemo<CommandCenterContextValue>(
    () => ({
      modal: modalState?.modal ?? null,
      payload: modalState?.payload ?? null,
      openModal,
      closeModal,
    }),
    [modalState, openModal, closeModal],
  );

  return (
    <CommandCenterContext.Provider value={value}>
      {children}
    </CommandCenterContext.Provider>
  );
};

export function useCommandCenterContext() {
  const context = useContext(CommandCenterContext);
  if (!context) {
    throw new Error(
      "useCommandCenterContext must be used within a CommandCenterContextProvider",
    );
  }
  return context;
}
