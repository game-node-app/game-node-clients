import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@repo/ui'

const meta = {
  title: 'Example/Button',
  component: Button,
  parameters: {
    // removed zeplinLink examples
  }
} satisfies Meta<typeof Button>

export default meta

export const Primary: StoryObj<typeof Button> = {
  args: {
    children: 'Button'
  }
}