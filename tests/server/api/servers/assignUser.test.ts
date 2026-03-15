import { describe, it, expect, vi, beforeEach } from 'vitest'
import assignUserHandler from '../../../../server/api/servers/assignUser'
import fs from 'fs/promises'

describe('Servers AssignUser API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should create new users list and add user if server has no users', async () => {
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user1',
      serverId: 'server1'
    })

    const result = await assignUserHandler(mockEvent as any)
    
    expect(result).toEqual({ status: 'success', message: 'User assigned to server', users: ['user1'] })

    const usersData = await fs.readFile('./db/serverUsers/users_server1.json', 'utf8')
    const users = JSON.parse(usersData)
    expect(users).toContain('user1')
  })

  it('should add user to existing users list', async () => {
    ;(fs as any).__setMockFileData('./db/serverUsers/users_server1.json', JSON.stringify(['user1']))

    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user2',
      serverId: 'server1'
    })

    const result = await assignUserHandler(mockEvent as any)
    expect(result.users).toContain('user2')
    expect(result.users).toHaveLength(2)

    const usersData = await fs.readFile('./db/serverUsers/users_server1.json', 'utf8')
    expect(JSON.parse(usersData)).toEqual(['user1', 'user2'])
  })

  it('should not add duplicate user', async () => {
    ;(fs as any).__setMockFileData('./db/serverUsers/users_server1.json', JSON.stringify(['user1']))

    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user1',
      serverId: 'server1'
    })

    const result = await assignUserHandler(mockEvent as any)
    expect(result.users).toHaveLength(1)

    const usersData = await fs.readFile('./db/serverUsers/users_server1.json', 'utf8')
    expect(JSON.parse(usersData)).toEqual(['user1'])
  })

  it('should throw 500 on error', async () => {
    // @ts-ignore
    globalThis.readBody.mockRejectedValueOnce(new Error('Body error'))

    try {
      await assignUserHandler(mockEvent as any)
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.statusCode).toBe(500)
      expect(e.message).toContain('Body error')
    }
  })
})
