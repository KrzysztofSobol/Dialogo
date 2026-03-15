import { describe, it, expect, vi, beforeEach } from 'vitest'
import getChatFriendsHandler from '../../../../server/api/chats/[id]'
import fs from 'fs/promises'

describe('Chats Get By ID API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should return list of friend ids that user has chats with', async () => {
    ;(fs as any).__setMockFileData('db/chats/chats_user1.json', JSON.stringify([
      { chatId: 'chat1', friendId: 'user2' },
      { chatId: 'chat2', friendId: 'user3' }
    ]))

    const mockEvent = { context: { params: { id: 'user1' } } }

    const result = await getChatFriendsHandler(mockEvent as any)
    
    expect(result).toEqual(['user2', 'user3'])
  })

  it('should return empty array if no chats file exists', async () => {
    const mockEvent = { context: { params: { id: 'user1' } } }

    const result = await getChatFriendsHandler(mockEvent as any)
    
    expect(result).toEqual([])
  })
})
