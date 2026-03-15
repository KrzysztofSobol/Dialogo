import { describe, it, expect, vi, beforeEach } from 'vitest'
import getChannelsByServerHandler from '../../../../server/api/channels/[id].get'
import fs from 'fs/promises'

describe('Channels Get By Server ID API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should return list of channels for a given server', async () => {
    const mockChannels = [
      { id: 'channel1', serverId: 'server1', title: 'General' },
      { id: 'channel2', serverId: 'server1', title: 'Voice' },
      { id: 'channel3', serverId: 'server2', title: 'General' }
    ]
    ;(fs as any).__setMockFileData('./db/channels.json', JSON.stringify(mockChannels))

    const mockEvent = { context: { params: { id: 'server1' } } }

    const result = await getChannelsByServerHandler(mockEvent as any)
    
    expect(result.channels).toHaveLength(2)
    expect(result.channels[0].id).toBe('channel1')
    expect(result.channels[1].id).toBe('channel2')
  })

  it('should return empty list with message if no channels found for server', async () => {
    const mockChannels = [
      { id: 'channel3', serverId: 'server2', title: 'General' }
    ]
    ;(fs as any).__setMockFileData('./db/channels.json', JSON.stringify(mockChannels))

    const mockEvent = { context: { params: { id: 'server1' } } }

    const result = await getChannelsByServerHandler(mockEvent as any)
    
    expect(result.channels).toHaveLength(0)
    expect(result.message).toBe('No channels found for this server')
  })

  it('should handle error if channels.json does not exist', async () => {
    const mockEvent = { context: { params: { id: 'server1' } } }
    const result = await getChannelsByServerHandler(mockEvent as any)
    
    expect(result).toEqual({ status: 500, message: 'Error getting channels' })
  })
})
