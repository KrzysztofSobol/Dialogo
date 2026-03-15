import { describe, it, expect, vi, beforeEach } from 'vitest'
import getFriendsHandler from '../../../../server/api/friends/[id]'
import fs from 'fs/promises'

describe('Friends Get API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should return list of friends for a given user', async () => {
    const mockFriends = ['friend1', 'friend2']
    ;(fs as any).__setMockFileData('db/friends/friends_user1.json', JSON.stringify(mockFriends))

    const mockUsers = [
      { id: 'friend1', username: 'Friend 1', avatar: 'f1.jpg' },
      { id: 'friend2', username: 'Friend 2', avatar: 'f2.jpg' },
      { id: 'other', username: 'Other', avatar: 'o.jpg' }
    ]
    ;(fs as any).__setMockFileData('./db/users.json', JSON.stringify(mockUsers))

    const mockEvent = { context: { params: { id: 'user1' } } }

    const result = await getFriendsHandler(mockEvent as any) as any
    
    expect(result.statusCode).toBe(200)
    expect(result.friends).toHaveLength(2)
    expect(result.friends[0].id).toBe('friend1')
    expect(result.friends[1].id).toBe('friend2')
  })

  it('should throw 500 if friends file does not exist', async () => {
    const mockEvent = { context: { params: { id: 'user1' } } }

    try {
      await getFriendsHandler(mockEvent as any)
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.statusCode).toBe(500)
      expect(e.message).toContain('Get friends error')
    }
  })
})
