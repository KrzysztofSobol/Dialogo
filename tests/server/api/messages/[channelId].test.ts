import { describe, it, expect, vi, beforeEach } from 'vitest'
import getMessagesHandler from '../../../../server/api/messages/[channelId]'
import fs from 'fs/promises'

describe('Messages Get By Channel API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should return list of messages for a given channel', async () => {
    const mockMessages = [
      { id: 'm1', content: 'hello', channelId: 'channel1' },
      { id: 'm2', content: 'world', channelId: 'channel1' }
    ]
    ;(fs as any).__setMockFileData('db/messagesByChannel/messages_channel1.json', JSON.stringify(mockMessages))

    const mockEvent = { context: { params: { channelId: 'channel1' } } }

    const result = await getMessagesHandler(mockEvent as any)
    
    expect(result).toHaveLength(2)
    expect(result).toEqual(mockMessages)
  })

  it('should return empty array if messages file does not exist', async () => {
    // We omit setting the mock file so it throws ENOENT

    const mockEvent = { context: { params: { channelId: 'channel2' } } }

    const result = await getMessagesHandler(mockEvent as any)
    
    expect(result).toEqual([])
  })
})
