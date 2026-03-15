import { describe, it, expect, vi, beforeEach } from 'vitest'
import addServerHandler from '../../../../server/api/servers/add'
import fs from 'fs/promises'

describe('Servers Add API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should create new servers.json and add server if file does not exist', async () => {
    const mockServerData = {
      id: 'server1',
      title: 'My First Server',
      ownerId: 'user1'
    }
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce(mockServerData)

    const result = await addServerHandler(mockEvent as any)
    
    expect(result.status).toBe('success')
    expect(result.message).toBe('Server added')
    expect(result.server).toMatchObject(mockServerData)
    expect(result.server.createdAt).toBeDefined()

    const serversData = await fs.readFile('./db/servers.json', 'utf8')
    const servers = JSON.parse(serversData)
    expect(servers).toHaveLength(1)
    expect(servers[0].id).toBe('server1')
  })

  it('should add server to existing servers.json', async () => {
    ;(fs as any).__setMockFileData('./db/servers.json', JSON.stringify([
      { id: 'server_existing', title: 'Existing Server', ownerId: 'user2', createdAt: '2023-01-01T00:00:00.000Z' }
    ]))

    const mockServerData = {
      id: 'server1',
      title: 'New Server',
      ownerId: 'user1'
    }
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce(mockServerData)

    const result = await addServerHandler(mockEvent as any)
    
    expect(result.status).toBe('success')
    expect(result.server.id).toBe('server1')

    const serversData = await fs.readFile('./db/servers.json', 'utf8')
    const servers = JSON.parse(serversData)
    expect(servers).toHaveLength(2)
    expect(servers[1].id).toBe('server1')
  })

  it('should throw 500 on error', async () => {
    // @ts-ignore
    globalThis.readBody.mockRejectedValueOnce(new Error('Body error'))

    try {
      await addServerHandler(mockEvent as any)
      expect(true).toBe(false) // should not reach
    } catch (e: any) {
      expect(e.statusCode).toBe(500)
      expect(e.message).toContain('Body error')
    }
  })
})
