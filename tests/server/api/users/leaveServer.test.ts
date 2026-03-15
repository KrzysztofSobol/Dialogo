import { describe, it, expect, vi, beforeEach } from 'vitest'
import leaveServerHandler from '../../../../server/api/users/leaveServer'
import fs from 'fs/promises'

describe('Users LeaveServer API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should remove server from users list', async () => {
    ;(fs as any).__setMockFileData('./db/userServers/servers_user1.json', JSON.stringify(['server1', 'server2']))

    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user1',
      serverId: 'server1'
    })

    const result = await leaveServerHandler(mockEvent as any)
    
    expect(result).toEqual({ status: 'success', message: 'Server removed from user\'s list', servers: ['server2'] })

    const serversData = await fs.readFile('./db/userServers/servers_user1.json', 'utf8')
    expect(JSON.parse(serversData)).toEqual(['server2'])
  })

  it('should throw error if user has no servers file', async () => {
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user1',
      serverId: 'server1'
    })

    try {
      await leaveServerHandler(mockEvent as any)
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.statusCode).toBe(500)
      expect(e.message).toContain('User has no servers assigned')
    }
  })

  it('should throw error if server is not in users list', async () => {
    ;(fs as any).__setMockFileData('./db/userServers/servers_user1.json', JSON.stringify(['server2']))

    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user1',
      serverId: 'server1'
    })

    try {
      await leaveServerHandler(mockEvent as any)
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.statusCode).toBe(500)
      expect(e.message).toContain("Server not found in user's list")
    }
  })
})
