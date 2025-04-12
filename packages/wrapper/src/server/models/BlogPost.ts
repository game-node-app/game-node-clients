/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlogPostImage } from './BlogPostImage';
import type { BlogPostTag } from './BlogPostTag';
import type { Profile } from './Profile';
export type BlogPost = {
    id: string;
    title: string;
    /**
     * The post HTML content
     */
    content: string;
    isDraft: boolean;
    profile: Profile;
    profileUserId: string;
    tags: Array<BlogPostTag>;
    /**
     * The main presentation image for this post.
     * Optional.
     */
    image: BlogPostImage | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
};

