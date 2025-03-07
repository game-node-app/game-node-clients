import React, { PropsWithChildren, useState } from "react";
import {
  CommentContextProps,
  CommentsContext,
} from "#@/components/comment/view/context.ts";

/**
 * Wrapper component that provides context used by comments components.
 * @constructor
 */
const CommentsView = ({ children }: PropsWithChildren) => {
  const [context, setContext] = useState<
    Omit<CommentContextProps, "updateContext">
  >({
    repliedCommentId: undefined,
    repliedCommentProfileUserId: undefined,
  });

  const updateContext = (
    updatedContext: Omit<CommentContextProps, "updateContext">,
  ) => {
    setContext((context) => ({
      ...context,
      ...updatedContext,
    }));
  };

  return (
    <CommentsContext.Provider
      value={{
        ...context,
        updateContext: updateContext,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
};

export { CommentsView };
