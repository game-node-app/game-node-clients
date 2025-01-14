import { ChangeEvent, ComponentPropsWithoutRef, useState } from "react";
import { TextInput, rem } from "@mantine/core";
import classes from "./FloatingLabelInput.module.css";
import clsx from "clsx";

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
    const floating =
        (value && value.trim().length !== 0) || focused || undefined;

    return (
        <TextInput
            {...props}
            label={label}
            classNames={{
                // @ts-ignore
                root: clsx(classes.root, props.classNames?.root),
                // @ts-ignore
                label: clsx(classes.label, props.classNames?.label),
                // @ts-ignore
                input: clsx(classes.input, props.classNames?.input),
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
