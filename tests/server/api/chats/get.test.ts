import { describe, it, expect, vi, beforeEach } from 'vitest'
import getChatHandler from '../../../../server/api/chats/get'
import fs from 'fs/promises'

describe('Chats Get API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should create new chat if one does not exist', async () => {
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user1',
      friendId: 'user2'
    })

    const result = await getChatHandler(mockEvent as any)
    
    expect(result).toBe('chatuser1user2')

    const user1Chats = JSON.parse(await fs.readFile('db/chats/chats_user1.json', 'utf8'))
    expect(user1Chats).toHaveLength(1)
    expect(user1Chats[0].chatId).toBe('chatuser1user2')
    expect(user1Chats[0].friendId).toBe('user2')

    const user2Chats = JSON.parse(await fs.readFile('db/chats/chats_user2.json', 'utf8'))
    expect(user2Chats).toHaveLength(1)
    expect(user2Chats[0].chatId).toBe('chatuser1user2')
    expect(user2Chats[0].friendId).toBe('user1')
  })

  it('should return existing chat id if they already have a chat', async () => {
    ;(fs as any).__setMockFileData('db/chats/chats_user1.json', JSON.stringify([
      { chatId: 'existingChatId', friendId: 'user2' }
    ]))

    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user1',
      friendId: 'user2'
    })

    const result = await getChatHandler(mockEvent as any)
    
    expect(result).toBe('existingChatId')
  })
})
