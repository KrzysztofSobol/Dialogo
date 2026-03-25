import { vi, describe, it, expect } from 'vitest'
import fs from 'fs/promises'

vi.mock('fs/promises')

import handler from '~/server/api/channels/[id].get'

describe('Channels API - Get by ID', () => {
  it('should return list of channels for a given server', async () => {
    const channels = [
      { id: 'ch1', serverId: 's1', title: 'General', creatorId: 'u1' },
      { id: 'ch2', serverId: 's2', title: 'Other', creatorId: 'u1' },
    ]
    const mockEvent = { context: { params: { id: 's1' } } } as any
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(channels) as any)

    const result = await handler(mockEvent)

    expect(result).toEqual({
      channels: [{ id: 'ch1', serverId: 's1', title: 'General', creatorId: 'u1' }],
    })
  })

  it('should return empty list with message if no channels found for server', async () => {
    const channels = [{ id: 'ch2', serverId: 's2', title: 'Other', creatorId: 'u1' }]
    const mockEvent = { context: { params: { id: 's1' } } } as any
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(channels) as any)

    const result = await handler(mockEvent)

    expect(result).toEqual({ message: 'No channels found for this server', channels: [] })
  })

  it('should handle error if channels.json does not exist', async () => {
    const mockEvent = { context: { params: { id: 's1' } } } as any
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'))

    const result = await handler(mockEvent)

    expect(result).toEqual({ status: 500, message: 'Error getting channels' })
  })
})
