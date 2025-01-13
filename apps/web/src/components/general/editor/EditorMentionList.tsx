import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useState,
} from "react";
import { SuggestionOptions, SuggestionProps } from "@tiptap/suggestion";
import { List, Paper } from "@mantine/core";

export type SuggestionListRef = {
    // For convenience using this SuggestionList from within the
    // mentionSuggestionOptions, we'll match the signature of SuggestionOptions's
    // `onKeyDown` returned in its `render` function
    onKeyDown: NonNullable<
        ReturnType<
            NonNullable<SuggestionOptions<string>["render"]>
        >["onKeyDown"]
    >;
};

export interface MentionSuggestion {
    id: string;
    label: string;
}

const EditorMentionList = forwardRef<
    SuggestionListRef,
    SuggestionProps<MentionSuggestion>
>((props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
        const item = props.items[index];

        if (item) {
            props.command(item);
        }
    };

    const upHandler = () => {
        setSelectedIndex(
            (selectedIndex + props.items.length - 1) % props.items.length,
        );
    };

    const downHandler = () => {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
        selectItem(selectedIndex);
    };

    useEffect(() => setSelectedIndex(0), [props.items]);

    // @ts-ignore
    useImperativeHandle(ref, () => ({
        onKeyDown: ({ event }: any) => {
            if (event.key === "ArrowUp") {
                upHandler();
                return true;
            }

            if (event.key === "ArrowDown") {
                downHandler();
                return true;
            }

            if (event.key === "Enter") {
                enterHandler();
                return true;
            }

            return false;
        },
    }));

    return (
        <Paper>
            <List>
                {props.items?.map((item, index) => {
                    return (
                        <List.Item
                            key={item.id}
                            onClick={() => selectItem(index)}
                            className={
                                index === selectedIndex
                                    ? "bg-brand-5 rounded-xs px-1"
                                    : undefined
                            }
                        >
                            {item.label}
                        </List.Item>
                    );
                })}
            </List>
        </Paper>
        // <div className="dropdown-menu">
        //     {props.items.length ? (
        //         props.items.map((item, index) => (
        //             <button
        //                 className={index === selectedIndex ? "is-selected" : ""}
        //                 key={index}
        //                 onClick={() => selectItem(index)}
        //             >
        //                 {item.label}
        //             </button>
        //         ))
        //     ) : (
        //         <div className="item">No result</div>
        //     )}
        // </div>
    );
});

EditorMentionList.displayName = "EditorMentionList";

export default EditorMentionList;
