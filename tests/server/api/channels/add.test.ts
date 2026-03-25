import { vi, describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import { readBodyMock } from '../../../setup'

vi.mock('fs/promises')

import handler from '~/server/api/channels/add'

describe('Channels API - Add', () => {
  const mockEvent = {} as any

  it('should add channel to existing channels list', async () => {
    const existing = [{ id: 'ch1', serverId: 's1', title: 'General', creatorId: 'u1' }]
    readBodyMock.mockResolvedValue({ id: 'ch2', serverId: 's1', title: 'Gaming', creatorId: 'u1' })
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(existing) as any)
    vi.mocked(fs.writeFile).mockResolvedValue()

    const result = await handler(mockEvent)

    expect(result).toMatchObject({ status: 200, message: 'Channel added successfully' })
    const written = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string)
    expect(written).toHaveLength(2)
    expect(written[1].id).toBe('ch2')
  })

  it('should handle error if channels.json does not exist (read fails)', async () => {
    readBodyMock.mockResolvedValue({ id: 'ch1', serverId: 's1', title: 'General', creatorId: 'u1' })
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'))

    const result = await handler(mockEvent)

    expect(result).toEqual({ status: 500, message: 'Error adding channel' })
  })
})
