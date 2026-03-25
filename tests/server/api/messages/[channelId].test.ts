import { vi, describe, it, expect } from 'vitest'
import fs from 'fs/promises'

vi.mock('fs/promises')

import handler from '~/server/api/messages/[channelId]'

describe('Messages API - Get by Channel', () => {
  it('should return list of messages for a given channel', async () => {
    const mockEvent = { context: { params: { channelId: 'ch1' } } } as any
    const messages = [
      {
        id: 'm1',
        channelId: 'ch1',
        content: 'Hello',
        author: 'alice',
        authorId: 'u1',
        publishDate: '2024-01-01',
      },
    ]
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(messages) as any)

    const result = await handler(mockEvent)

    expect(result).toEqual(messages)
  })

  it('should return empty array if messages file does not exist', async () => {
    const mockEvent = { context: { params: { channelId: 'ch1' } } } as any
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'))

    const result = await handler(mockEvent)

    expect(result).toEqual([])
  })
})
