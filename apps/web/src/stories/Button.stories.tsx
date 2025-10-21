import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@mantine/core';

const meta: Meta<typeof Button> = {
  title: 'Mantine/Button',
  component: Button,
  args: {
    children: 'Clique-me',
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primario: Story = {
  args: {
    color: 'blue',
  },
};

export const Secundario: Story = {
  args: {
    color: 'gray',
  },
};