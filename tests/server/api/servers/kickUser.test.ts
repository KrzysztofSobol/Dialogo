import { describe, it, expect, vi, beforeEach } from 'vitest'
import kickUserHandler from '../../../../server/api/servers/kickUser'
import fs from 'fs/promises'

describe('Servers KickUser API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should remove user from servers user list', async () => {
    ;(fs as any).__setMockFileData('./db/serverUsers/users_server1.json', JSON.stringify(['user1', 'user2']))

    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user1',
      serverId: 'server1'
    })

    const result = await kickUserHandler(mockEvent as any)
    
    expect(result).toEqual({ status: 'success', message: 'User removed from server\'s list', users: ['user2'] })

    const usersData = await fs.readFile('./db/serverUsers/users_server1.json', 'utf8')
    expect(JSON.parse(usersData)).toEqual(['user2'])
  })

  it('should throw error if server has no users file', async () => {
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user1',
      serverId: 'server1'
    })

    try {
      await kickUserHandler(mockEvent as any)
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.statusCode).toBe(500) // The catch block in handler wraps it in 500
      expect(e.message).toContain('Server has no users assigned')
    }
  })

  it('should throw error if user is not in servers list', async () => {
    ;(fs as any).__setMockFileData('./db/serverUsers/users_server1.json', JSON.stringify(['user2']))

    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user1',
      serverId: 'server1'
    })

    try {
      await kickUserHandler(mockEvent as any)
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.statusCode).toBe(500)
      expect(e.message).toContain("User not found in server's list")
    }
  })
})
