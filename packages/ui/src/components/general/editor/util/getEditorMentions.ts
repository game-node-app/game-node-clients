import { JSONContent } from "@tiptap/react";

function getMentionNodes(item: JSONContent[] | JSONContent): JSONContent[] {
    const mentionNodes: JSONContent[] = [];

    if (Array.isArray(item)) {
        for (const node of item) {
            if (node.type === "mention") {
                mentionNodes.push(node);
            } else if (Array.isArray(node.content)) {
                mentionNodes.push(...getMentionNodes(node.content));
            }
        }
    } else if (!Array.isArray(item) && Array.isArray(item.content)) {
        mentionNodes.push(...getMentionNodes(item.content));
    }

    return mentionNodes;
}

/**
 * Returns the list of possible user ids mentioned in a editor's content.
 */
export default function getEditorMentions(jsonContent: JSONContent) {
    const mentionedUsers: string[] = [];
    if (!jsonContent.content) {
        return [];
    }

    const mentionNodes = getMentionNodes(jsonContent);

    for (const node of mentionNodes) {
        if (node && node.attrs && Object.hasOwn(node.attrs, "id")) {
            mentionedUsers.push(node.attrs.id);
        }
    }

    return mentionedUsers;
}
