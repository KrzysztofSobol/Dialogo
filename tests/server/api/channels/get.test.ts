import { describe, it, expect, vi, beforeEach } from 'vitest'
import getChannelsHandler from '../../../../server/api/channels/get'
import fs from 'fs/promises'

describe('Channels Get API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should return list of channels', async () => {
    const mockChannels = [
      { id: 'channel1', serverId: 'server1', title: 'General', creatorId: 'user1' }
    ]
    ;(fs as any).__setMockFileData('./db/channels.json', JSON.stringify(mockChannels))

    const result = await getChannelsHandler(mockEvent as any)
    
    expect(result).toEqual(mockChannels)
  })

  it('should handle error if channels.json does not exist', async () => {
    const result = await getChannelsHandler(mockEvent as any)
    
    expect(result).toEqual({ status: 500, message: 'Error getting channels' })
  })
})
