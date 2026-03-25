import { vi, describe, it, expect } from 'vitest'
import fs from 'fs/promises'

vi.mock('fs/promises')

import handler from '~/server/api/chats/[id]'

describe('Chats API - Get by ID', () => {
  it('should return list of friend ids that user has chats with', async () => {
    const mockEvent = { context: { params: { id: 'u1' } } } as any
    vi.mocked(fs.readFile).mockResolvedValue(
      JSON.stringify([
        { chatId: 'chat1', friendId: 'u2' },
        { chatId: 'chat2', friendId: 'u3' },
      ]) as any
    )

    const result = await handler(mockEvent)

    expect(result).toEqual(['u2', 'u3'])
  })

  it('should return empty array if no chats file exists', async () => {
    const mockEvent = { context: { params: { id: 'u1' } } } as any
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'))

    const result = await handler(mockEvent)

    expect(result).toEqual([])
  })
})
