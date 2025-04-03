import { Box, Group, SimpleGrid, Stack } from "@mantine/core";
import React, { useCallback } from "react";
import { BlogPostCard } from "#@/components";

const mockPosts = [
  {
    image:
      "https://media.istockphoto.com/id/1448737609/pt/foto/over-the-shoulder-angle-of-a-young-female-gamer-winning-in-a-video-game-on-personal-computer.webp?s=2048x2048&w=is&k=20&c=4itjBMBZ63Xq6UrymMMWhrQnzpdMEpmSQc9NG7BB93g=",
    title: "Sample Post 1",
    content: "This is a short content for post 1.",
    createdAt: "2025-03-08T20:04:17.661Z",
    profileUserId: "e80e70d9-b877-46e6-ae8d-625b71ba79b6",
  },
  {
    image:
      "https://media.istockphoto.com/id/1334436084/pt/foto/top-down-view-of-colorful-illuminated-gaming-accessories-laying-on-table.jpg?s=612x612&w=0&k=20&c=RADkpRxqLuKNRojQHMbRqcyiuqjt3BJ2Nj8DPgvrTAs=",
    title: "Sample Post 2",
    content: "This is a short content for post 2.",
    createdAt: "2025-03-08T20:04:17.661Z",
    profileUserId: "e80e70d9-b877-46e6-ae8d-625b71ba79b6",
  },
  {
    image:
      "https://media.istockphoto.com/id/1396079593/pt/foto/gamepad-and-headphones-with-copy-space-3d-render.jpg?s=612x612&w=0&k=20&c=QoZjJTIPf6-atYbVEeLY5uq37bnJOZYOXAfx43VqbnE=",
    title: "Sample Post 3",
    content: "This is a short content for post 3.",
    createdAt: "2025-03-08T20:04:17.661Z",
    profileUserId: "e80e70d9-b877-46e6-ae8d-625b71ba79b6",
  },
  {
    image:
      "https://media.istockphoto.com/id/1339094198/pt/foto/rear-view-of-a-gaming-setup-with-desktop-pc-and-a-big-monitor.jpg?s=612x612&w=0&k=20&c=ei1uQ0gCr-hUQSFOF4qcxZ8jmuIWteAVRVyiOUafO7k=",
    title: "Sample Post 4",
    content: "This is a short content for post 4.",
    createdAt: "2025-03-08T20:04:17.661Z",
    profileUserId: "e80e70d9-b877-46e6-ae8d-625b71ba79b6",
  },
  {
    image: "https://placehold.co/600x400",
    title: "Sample Post 5",
    content: "This is a short content for post 5.",
    createdAt: "2025-03-08T20:04:17.661Z",
    profileUserId: "e80e70d9-b877-46e6-ae8d-625b71ba79b6",
  },
  {
    image: "https://placehold.co/600x400",
    title: "Sample Post 6",
    content: "This is a short content for post 6.",
    createdAt: "2025-03-08T20:04:17.661Z",
    profileUserId: "e80e70d9-b877-46e6-ae8d-625b71ba79b6",
  },
];

interface Props {
  limit?: number;
}

const BlogPostsFeed = ({ limit = 10 }: Props) => {
  const renderRemainingPosts = useCallback(() => {
    const remainingItems = mockPosts.slice(1);
    return remainingItems.map((post, index) => {
      return <BlogPostCard key={index} post={post} />;
    });
  }, []);

  const firstPost = mockPosts.at(0);

  return (
    <Stack className="w-full">
      {firstPost && <BlogPostCard post={firstPost} />}
      <SimpleGrid
        cols={{
          base: 1,
          lg: 2,
        }}
        className="w-full"
      >
        {renderRemainingPosts()}
      </SimpleGrid>
    </Stack>
  );
};

export { BlogPostsFeed };
