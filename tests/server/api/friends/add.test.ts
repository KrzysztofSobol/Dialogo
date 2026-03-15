import { describe, it, expect, vi, beforeEach } from 'vitest'
import addFriendHandler from '../../../../server/api/friends/add'
import fs from 'fs/promises'

describe('Friends Add API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should successfully add friend and update both users files', async () => {
    ;(fs as any).__setMockFileData('./db/users.json', JSON.stringify([
      { id: 'user1', username: 'User 1' },
      { id: 'friend1', username: 'Friend 1', avatar: 'f1.jpg' }
    ]))

    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user1',
      friendCode: 'friend1'
    })

    const result = await addFriendHandler(mockEvent as any) as any
    
    expect(result.status).toBe('success')
    expect(result.message).toBe('Message:Friend added successfully')
    expect(result.friend.id).toBe('friend1')

    const user1Friends = JSON.parse(await fs.readFile('db/friends/friends_user1.json', 'utf8'))
    expect(user1Friends).toContain('friend1')

    const friend1Friends = JSON.parse(await fs.readFile('db/friends/friends_friend1.json', 'utf8'))
    expect(friend1Friends).toContain('user1')
  })

  it('should throw 404 if friend code not found', async () => {
    ;(fs as any).__setMockFileData('./db/users.json', JSON.stringify([
      { id: 'user1', username: 'User 1' }
    ]))

    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user1',
      friendCode: 'nonexistent'
    })

    try {
      await addFriendHandler(mockEvent as any)
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.statusCode).toBe(404)
      expect(e.message).toContain('Friend code: [nonexistent] not found')
    }
  })

  it('should throw 404 if trying to add self', async () => {
    ;(fs as any).__setMockFileData('./db/users.json', JSON.stringify([
      { id: 'user1', username: 'User 1' }
    ]))

    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user1',
      friendCode: 'user1'
    })

    try {
      await addFriendHandler(mockEvent as any)
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.statusCode).toBe(404)
      expect(e.message).toContain('This is your friend code')
    }
  })

  it('should throw 409 if already friends', async () => {
    ;(fs as any).__setMockFileData('./db/users.json', JSON.stringify([
      { id: 'user1', username: 'User 1' },
      { id: 'friend1', username: 'Friend 1' }
    ]))

    ;(fs as any).__setMockFileData('db/friends/friends_user1.json', JSON.stringify(['friend1']))

    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user1',
      friendCode: 'friend1'
    })

    try {
      await addFriendHandler(mockEvent as any)
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.statusCode).toBe(409)
      expect(e.message).toContain('You are already friends with this user')
    }
  })
})
