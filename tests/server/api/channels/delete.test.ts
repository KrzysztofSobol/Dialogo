import { describe, it, expect, vi, beforeEach } from 'vitest'
import deleteChannelHandler from '../../../../server/api/channels/[channelId]/delete'
import fs from 'fs/promises'

describe('Channels Delete API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should throw error if no channelId in params', async () => {
    const mockEvent = { context: { params: {} } }
    
    try {
      await deleteChannelHandler(mockEvent as any)
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.statusCode).toBe(400)
      expect(e.message).toContain('Channel ID is required')
    }
  })

  it('should delete channel and its messages if both exist', async () => {
    const mockEvent = { context: { params: { channelId: 'channel1' } } }
    
    ;(fs as any).__setMockFileData('./db/channels.json', JSON.stringify([
      { id: 'channel1', title: 'C1' },
      { id: 'channel2', title: 'C2' }
    ]))
    // Mock the messages file so unlink succeeds
    ;(fs as any).__setMockFileData('./db/messages/channel_channel1.json', 'messages_data')

    const result = await deleteChannelHandler(mockEvent as any)
    
    expect(result).toEqual({ status: 'success', message: 'Channel and all associated messages deleted successfully' })

    const channelsData = await fs.readFile('./db/channels.json', 'utf8')
    const channels = JSON.parse(channelsData)
    expect(channels).toHaveLength(1)
    expect(channels[0].id).toBe('channel2')

    let fileExists = false
    try {
      await fs.readFile('./db/messages/channel_channel1.json', 'utf8')
      fileExists = true
    } catch (e) {
      fileExists = false
    }
    expect(fileExists).toBe(false)
  })

  it('should delete channel even if messages file does not exist', async () => {
    const mockEvent = { context: { params: { channelId: 'channel1' } } }
    
    ;(fs as any).__setMockFileData('./db/channels.json', JSON.stringify([
      { id: 'channel1', title: 'C1' }
    ]))
    // Intentionally omit messages file

    const result = await deleteChannelHandler(mockEvent as any)
    
    expect(result.status).toBe('success')

    const channelsData = await fs.readFile('./db/channels.json', 'utf8')
    const channels = JSON.parse(channelsData)
    expect(channels).toHaveLength(0)
  })

  it('should throw 500 if reading channels.json fails', async () => {
    const mockEvent = { context: { params: { channelId: 'channel1' } } }
    // Omit channels.json to cause readFile to fail

    try {
      await deleteChannelHandler(mockEvent as any)
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.statusCode).toBe(500)
      expect(e.message).toContain('Failed to delete channel')
    }
  })
})
