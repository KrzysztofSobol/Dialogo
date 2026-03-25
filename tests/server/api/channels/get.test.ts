import { vi, describe, it, expect } from 'vitest'
import fs from 'fs/promises'

vi.mock('fs/promises')

import handler from '~/server/api/channels/get'

describe('Channels API - Get', () => {
  const mockEvent = {} as any

  it('should return list of channels', async () => {
    const channels = [
      { id: 'ch1', serverId: 's1', title: 'General', creatorId: 'u1' },
      { id: 'ch2', serverId: 's2', title: 'Gaming', creatorId: 'u1' },
    ]
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(channels) as any)

    const result = await handler(mockEvent)

    expect(result).toEqual(channels)
  })

  it('should handle error if channels.json does not exist', async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT: no such file'))

    const result = await handler(mockEvent)

    expect(result).toEqual({ status: 500, message: 'Error getting channels' })
  })
})
