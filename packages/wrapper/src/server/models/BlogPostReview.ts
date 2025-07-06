/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlogPost } from './BlogPost';
import type { Game } from './Game';
export type BlogPostReview = {
    /**
     * PK and FK targeting BlogPost
     */
    postId: string;
    game: Game;
    gameId: number;
    rating: number;
    post: BlogPost;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

