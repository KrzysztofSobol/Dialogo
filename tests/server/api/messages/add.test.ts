import { describe, it, expect, vi, beforeEach } from 'vitest'
import addHandler from '../../../../server/api/messages/add'
import fs from 'fs/promises'
import * as websocket from '../../../../server/websocket'

vi.mock('../../../../server/websocket', () => ({
  sendMessageToChannel: vi.fn(),
  sendChatNotifications: vi.fn(),
  sendServerNotifications: vi.fn(),
}))

describe('Messages Add API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should add message to chat and send notifications', async () => {
    const mockMessage = {
      channelId: 'chatuser1user2',
      authorId: 'user1',
      content: 'Hello'
    }
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce(mockMessage)

    const result = await addHandler(mockEvent as any)
    
    expect(result).toEqual({ status: 'success', message: 'Message added' })
    const messagesData = await fs.readFile('./db/messagesByChannel/messages_chatuser1user2.json', 'utf8')
    const messages = JSON.parse(messagesData)
    expect(messages).toHaveLength(1)
    expect(messages[0].content).toBe('Hello')

    expect(websocket.sendChatNotifications).toHaveBeenCalledWith(mockMessage, 'user2')
    expect(websocket.sendMessageToChannel).toHaveBeenCalledWith(mockMessage)
  })

  it('should add message to server channel and send notifications', async () => {
    const mockMessage = {
      channelId: 'channel1',
      authorId: 'user1',
      content: 'Hello channel'
    }
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce(mockMessage)
    
    ;(fs as any).__setMockFileData('./db/channels.json', JSON.stringify([
      { id: 'channel1', serverId: 'server1', title: 'General' }
    ]))
    ;(fs as any).__setMockFileData('./db/servers.json', JSON.stringify([
      { id: 'server1', title: 'My Server' }
    ]))
    ;(fs as any).__setMockFileData('./db/serverUsers/users_server1.json', JSON.stringify([
      'user1', 'user2'
    ]))

    const result = await addHandler(mockEvent as any)
    
    expect(result).toEqual({ status: 'success', message: 'Message added' })
    expect(websocket.sendServerNotifications).toHaveBeenCalledWith(
      mockMessage, 'My Server', 'server1', 'General', ['user1', 'user2']
    )
    expect(websocket.sendMessageToChannel).toHaveBeenCalledWith(mockMessage)
  })

  it('should throw 403 if user is not a member of the server', async () => {
    const mockMessage = {
      channelId: 'channel1',
      authorId: 'user3', // Not a member
      content: 'Hello channel'
    }
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce(mockMessage)
    
    ;(fs as any).__setMockFileData('./db/channels.json', JSON.stringify([
      { id: 'channel1', serverId: 'server1', title: 'General' }
    ]))
    ;(fs as any).__setMockFileData('./db/servers.json', JSON.stringify([
      { id: 'server1', title: 'My Server' }
    ]))
    ;(fs as any).__setMockFileData('./db/serverUsers/users_server1.json', JSON.stringify([
      'user1', 'user2'
    ]))

    try {
      await addHandler(mockEvent as any)
      expect(true).toBe(false) // should not reach here
    } catch (e: any) {
      expect(e.statusCode).toBe(403)
      expect(e.message).toContain('You are not a member of this server')
    }
  })
})
