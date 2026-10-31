import { TextInput } from "@mantine/core";
import clsx from "clsx";
import { ChangeEvent, ComponentPropsWithoutRef, useState } from "react";
import classes from "./FloatingLabelInput.module.css";

export interface IFloatingLabelInputProps
  extends ComponentPropsWithoutRef<typeof TextInput> {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function FloatingLabelInput({
  label,
  value,
  onChange,
  ...props
}: IFloatingLabelInputProps) {
  const [focused, setFocused] = useState(false);
  const floating = (value && value.trim().length !== 0) || focused || undefined;

  return (
    <TextInput
      {...props}
      label={label}
      classNames={(theme, inputProps, context) => {
        const overrides =
          typeof props.classNames === "function"
            ? props.classNames(theme, inputProps, context)
            : props.classNames;
        return {
          root: clsx(classes.root, overrides?.root),
          label: clsx(classes.label, overrides?.label),
          input: clsx(classes.input, overrides?.input),
        };
      }}
      value={value ?? ""}
      onChange={onChange}
      onFocus={(event) => {
        setFocused(true);
        if (props.onFocus) {
          props.onFocus(event);
        }
      }}
      onBlur={(evt) => {
        setFocused(false);
        if (props.onBlur) {
          props.onBlur(evt);
        }
      }}
      data-floating={floating}
      labelProps={{ "data-floating": floating }}
    />
  );
}
