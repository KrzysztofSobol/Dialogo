import { describe, it, expect, vi, beforeEach } from 'vitest'
// @ts-ignore
import handler from '../../../../../server/api/servers/[serverId]/[userId].delete.ts'
import fs from 'fs/promises'
import * as h3 from 'h3'

describe('Server User Delete API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(h3, 'getRouterParam').mockImplementation((event, param) => {
      return (event as any).context.params[param]
    })
  })

  it('should throw 400 if serverId or userId is missing', async () => {
    const event = { context: { params: {} } } as any
    await expect(handler(event)).rejects.toThrow('Server ID and User ID are required')
  })

  it('should remove user from server and server from user', async () => {
    vi.mocked(fs.readFile).mockImplementation(async (path) => {
      if (path === './db/serverUsers/users_server1.json') return JSON.stringify(['user1', 'user2'])
      if (path === './db/userServers/servers_user1.json') return JSON.stringify(['server1', 'server2'])
      return '[]'
    })
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const event = { context: { params: { serverId: 'server1', userId: 'user1' } } } as any
    const response = await handler(event)

    expect(response).toEqual({
      status: 'success',
      message: 'User-server relationship removed'
    })

    expect(fs.writeFile).toHaveBeenCalledWith(
      './db/serverUsers/users_server1.json',
      JSON.stringify(['user2'], null, 2)
    )
    expect(fs.writeFile).toHaveBeenCalledWith(
      './db/userServers/servers_user1.json',
      JSON.stringify(['server2'], null, 2)
    )
  })

  it('should handle missing files gracefully', async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'))
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const event = { context: { params: { serverId: 'server1', userId: 'user1' } } } as any
    const response = await handler(event)

    expect(response).toEqual({
      status: 'success',
      message: 'User-server relationship removed'
    })

    expect(fs.writeFile).toHaveBeenCalledWith('./db/serverUsers/users_server1.json', '[]')
    expect(fs.writeFile).toHaveBeenCalledWith('./db/userServers/servers_user1.json', '[]')
  })

  it('should handle writeFile failure', async () => {
    vi.mocked(fs.readFile).mockResolvedValue('[]')
    vi.mocked(fs.writeFile).mockRejectedValueOnce(new Error('Write error'))

    const event = { context: { params: { serverId: 'server1', userId: 'user1' } } } as any
    await expect(handler(event)).rejects.toThrow('Failed to remove user-server relationship')
  })
})
