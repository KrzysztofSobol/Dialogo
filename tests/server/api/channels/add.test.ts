import { describe, it, expect, vi, beforeEach } from 'vitest'
import addChannelHandler from '../../../../server/api/channels/add'
import fs from 'fs/promises'

describe('Channels Add API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should add channel to existing channels list', async () => {
    ;(fs as any).__setMockFileData('./db/channels.json', JSON.stringify([]))

    const mockChannel = {
      id: 'channel1',
      serverId: 'server1',
      title: 'General',
      creatorId: 'user1'
    }

    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce(mockChannel)

    const result = await addChannelHandler(mockEvent as any)
    
    expect(result).toEqual({ status: 200, message: 'Channel added successfully', channel: mockChannel })

    const channelsData = await fs.readFile('./db/channels.json', 'utf8')
    const channels = JSON.parse(channelsData)
    expect(channels).toHaveLength(1)
    expect(channels[0]).toEqual(mockChannel)
  })

  it('should handle error if channels.json does not exist (read fails)', async () => {
    // We do NOT set mock file data, so readFile will throw

    const mockChannel = {
      id: 'channel1',
      serverId: 'server1',
      title: 'General',
      creatorId: 'user1'
    }

    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce(mockChannel)

    const result = await addChannelHandler(mockEvent as any)
    
    expect(result).toEqual({ status: 500, message: 'Error adding channel' })
  })
})
