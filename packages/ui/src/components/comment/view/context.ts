import { createContext, useContext } from "react";

export interface CommentContextProps {
  // User id of the owner of the currently replied comment
  repliedCommentProfileUserId: string | undefined;
  // Id of the currently replied comment
  repliedCommentId: string | undefined;
  updateContext: (v: Omit<CommentContextProps, "updateContext">) => void;
}

export const CommentsContext = createContext<CommentContextProps>({
  repliedCommentId: undefined,
  repliedCommentProfileUserId: undefined,
  updateContext: () => {
    throw new Error(
      "Comments context not provided! Make sure <CommentsView /> is used as wrapper.",
    );
  },
});

export function useCommentsContext() {
  return useContext(CommentsContext);
}
