import { describe, it, expect, vi, beforeEach } from 'vitest'
import assignServerHandler from '../../../../server/api/users/assignServer'
import fs from 'fs/promises'

describe('Users AssignServer API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should create new servers list and add server if user has no servers', async () => {
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user1',
      serverId: 'server1'
    })

    const result = await assignServerHandler(mockEvent as any)
    
    expect(result).toEqual({ status: 'success', message: 'Server assigned to user', servers: ['server1'] })

    const serversData = await fs.readFile('./db/userServers/servers_user1.json', 'utf8')
    const servers = JSON.parse(serversData)
    expect(servers).toContain('server1')
  })

  it('should add server to existing servers list', async () => {
    ;(fs as any).__setMockFileData('./db/userServers/servers_user1.json', JSON.stringify(['server1']))

    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user1',
      serverId: 'server2'
    })

    const result = await assignServerHandler(mockEvent as any)
    expect(result.servers).toContain('server2')
    expect(result.servers).toHaveLength(2)

    const serversData = await fs.readFile('./db/userServers/servers_user1.json', 'utf8')
    expect(JSON.parse(serversData)).toEqual(['server1', 'server2'])
  })

  it('should not add duplicate server', async () => {
    ;(fs as any).__setMockFileData('./db/userServers/servers_user1.json', JSON.stringify(['server1']))

    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user1',
      serverId: 'server1'
    })

    const result = await assignServerHandler(mockEvent as any)
    expect(result.servers).toHaveLength(1)

    // Verify it wasn't written again, though our mock just overwrites so checking length is fine
    const serversData = await fs.readFile('./db/userServers/servers_user1.json', 'utf8')
    expect(JSON.parse(serversData)).toEqual(['server1'])
  })
})
