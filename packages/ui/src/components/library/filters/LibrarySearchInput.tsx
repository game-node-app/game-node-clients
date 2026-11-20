import { cn } from "#@/util";
import { CloseButton, Loader, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  /** The committed search, i.e. what the listing is currently filtered by. */
  value: string;
  onSearchChange: (search: string) => void;
  placeholder: string;
  isLoading?: boolean;
  className?: string;
}

const LibrarySearchInput = ({
  value,
  onSearchChange,
  placeholder,
  isLoading,
  className,
}: Props) => {
  const { t } = useTranslation();
  const [text, setText] = useState(value);
  const [debounced] = useDebouncedValue(text, 300);
  // Last value we committed or synced, so our own commit does not overwrite what the user typed since.
  const committed = useRef(value);

  const commit = (next: string) => {
    committed.current = next;
    onSearchChange(next);
  };

  const clear = () => {
    setText("");
    commit("");
  };

  useEffect(() => {
    if (value !== committed.current) {
      committed.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(() => {
    // `debounced === text` skips a stale debounced value left over after clear/Escape.
    if (debounced === text && debounced.trim() !== committed.current.trim()) {
      commit(debounced);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <TextInput
      type="search"
      size="sm"
      radius="xl"
      className={cn("w-full", className)}
      classNames={{
        // The native clear button would sit next to ours.
        input: "[&::-webkit-search-cancel-button]:hidden",
      }}
      aria-label={t("library.search.label")}
      placeholder={placeholder}
      maxLength={256}
      value={text}
      onChange={(event) => setText(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && text) {
          event.preventDefault();
          clear();
        }
      }}
      leftSection={<IconSearch size={16} />}
      rightSectionPointerEvents="all"
      rightSection={
        isLoading ? (
          <Loader size="xs" />
        ) : text ? (
          <CloseButton
            size="sm"
            aria-label={t("library.search.clear")}
            onClick={clear}
          />
        ) : null
      }
    />
  );
};

export { LibrarySearchInput };
