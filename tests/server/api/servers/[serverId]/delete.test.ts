import { describe, it, expect, vi, beforeEach } from 'vitest'
// @ts-ignore
import handler from '../../../../../server/api/servers/[serverId]/delete.ts'
import fs from 'fs/promises'

describe('Servers Delete API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should throw 400 if serverId is missing', async () => {
    const event = { context: { params: {} } } as any
    await expect(handler(event)).rejects.toThrow('Server ID is required')
  })

  it('should delete server and all associated data', async () => {
    const mockChannels = [
      { id: 'ch1', serverId: 'server1', title: 'General', creatorId: 'user1' },
      { id: 'ch2', serverId: 'server2', title: 'Random', creatorId: 'user2' }
    ]
    const mockServers = [
      { id: 'server1', title: 'Server One', creatorId: 'user1', createdAt: '2023' },
      { id: 'server2', title: 'Server Two', creatorId: 'user2', createdAt: '2023' }
    ]

    vi.mocked(fs.readFile).mockImplementation(async (path) => {
      if (path === './db/channels.json') return JSON.stringify(mockChannels)
      if (path === './db/servers.json') return JSON.stringify(mockServers)
      if (path === './db/userServers/servers_user1.json') return JSON.stringify(['server1', 'server2'])
      if (path === './db/userServers/servers_user2.json') return JSON.stringify(['server2'])
      return '[]'
    })

    vi.mocked(fs.readdir).mockResolvedValueOnce([
      'servers_user1.json',
      'servers_user2.json'
    ] as any)

    vi.mocked(fs.unlink).mockResolvedValue(undefined)
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)

    const event = { context: { params: { serverId: 'server1' } } } as any

    const response = await handler(event)

    expect(response).toEqual({
      status: 'success',
      message: 'Server and all associated data deleted successfully'
    })

    // Assert channels update
    expect(fs.writeFile).toHaveBeenCalledWith(
      './db/channels.json',
      expect.stringContaining('ch2') // channel 2 should remain
    )
    expect(fs.writeFile).not.toHaveBeenCalledWith(
      './db/channels.json',
      expect.stringContaining('ch1') // channel 1 should be removed
    )

    // Assert server messages unlinked
    expect(fs.unlink).toHaveBeenCalledWith('./db/messages/channel_ch1.json')

    // Assert servers update
    expect(fs.writeFile).toHaveBeenCalledWith(
      './db/servers.json',
      expect.stringContaining('server2')
    )
    expect(fs.writeFile).not.toHaveBeenCalledWith(
      './db/servers.json',
      expect.stringContaining('Server One')
    )

    // Assert server users file unlinked
    expect(fs.unlink).toHaveBeenCalledWith('./db/serverUsers/users_server1.json')

    // Assert user servers update
    expect(fs.writeFile).toHaveBeenCalledWith(
      './db/userServers/servers_user1.json',
      JSON.stringify(['server2'], null, 2)
    )
  })

  it('should ignore unlink errors if files do not exist', async () => {
    const mockChannels = [{ id: 'ch1', serverId: 'server1', title: 'General', creatorId: 'user1' }]
    const mockServers = [{ id: 'server1', title: 'Server One', creatorId: 'user1', createdAt: '2023' }]

    vi.mocked(fs.readFile).mockImplementation(async (path) => {
      if (path === './db/channels.json') return JSON.stringify(mockChannels)
      if (path === './db/servers.json') return JSON.stringify(mockServers)
      return '[]'
    })
    vi.mocked(fs.readdir).mockResolvedValueOnce([])

    // Make unlink fail
    vi.mocked(fs.unlink).mockRejectedValue(new Error('ENOENT'))

    const event = { context: { params: { serverId: 'server1' } } } as any
    const response = await handler(event)

    expect(response).toEqual({
      status: 'success',
      message: 'Server and all associated data deleted successfully'
    })
  })

  it('should throw 500 if a crucial error occurs', async () => {
    vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('File system error'))
    const event = { context: { params: { serverId: 'server1' } } } as any

    await expect(handler(event)).rejects.toThrow('Failed to delete server')
  })
})
